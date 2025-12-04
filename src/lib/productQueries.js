import { supabase } from './supabase';
import { uploadProductImages, saveProductImagesToDB } from './storageHelpers';

// Get all available products with seller and category info
export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
}

// Get products by category
export async function getProductsByCategory(categoryName) {
  try {
    const { data, error } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('status', 'available')
      .eq('category_name', categoryName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    throw error;
  }
}

// Get single product by ID with full details
export async function getProductById(productId) {
  try {
    // Get product with seller and category details
    const { data: product, error: productError } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      throw productError;
    }

    // Get product images
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');

    if (imagesError) {
      console.error('Error fetching product images:', imagesError);
    }

    // Get product specifications
    const { data: specifications, error: specsError } = await supabase
      .from('product_specifications')
      .select('*')
      .eq('product_id', productId);

    if (specsError) {
      console.error('Error fetching product specifications:', specsError);
    }

    // Increment view count
    await incrementProductViews(productId);

    return {
      ...product,
      images: images || [],
      specifications: specifications || []
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
}

// Search products
export async function searchProducts(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('products_with_details')
      .select('*')
      .textSearch('search_vector', searchTerm)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
}

// Increment product views
export async function incrementProductViews(productId) {
  try {
    const { error } = await supabase.rpc('increment_product_views', {
      product_id: productId
    });

    if (error) {
      console.error('Error incrementing product views:', error);
    }
  } catch (error) {
    console.error('Error in incrementProductViews:', error);
  }
}

// Get user's products (for dashboard/profile)
export async function getUserProducts(userId) {
  try {
    const { data, error } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user products:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProducts:', error);
    throw error;
  }
}

// Add new product
export async function addProduct(productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
}

// Add new product with images
export async function addProductWithImages(productData, processedImages = []) {
  try {
    // First, add the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        seller_id: productData.seller_id,
        category_id: productData.category_id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        condition: productData.condition,
        is_negotiable: productData.is_negotiable || false,
        location: productData.location,
        status: 'available'
      }])
      .select()
      .single();

    if (productError) {
      console.error('Error adding product:', productError);
      throw productError;
    }

    // If images are provided, save them to database
    if (processedImages && processedImages.length > 0) {
      await saveProductImagesToDB(product.id, processedImages);
    }

    return product;
  } catch (error) {
    console.error('Error in addProductWithImages:', error);
    throw error;
  }
}

// Add product specifications
export async function addProductSpecifications(productId, specifications) {
  try {
    if (!specifications || specifications.length === 0) return [];

    const specRecords = specifications.map(spec => ({
      product_id: productId,
      spec_name: spec.name,
      spec_value: spec.value
    }));

    const { data, error } = await supabase
      .from('product_specifications')
      .insert(specRecords)
      .select();

    if (error) {
      console.error('Error adding specifications:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addProductSpecifications:', error);
    throw error;
  }
}

// Delete product specifications
export async function deleteProductSpecifications(productId) {
  try {
    const { error } = await supabase
      .from('product_specifications')
      .delete()
      .eq('product_id', productId);

    if (error) {
      console.error('Error deleting specifications:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProductSpecifications:', error);
    throw error;
  }
}

// Update product specifications (replaces all existing specifications)
export async function updateProductSpecifications(productId, specifications) {
  try {
    // First delete existing specifications
    await deleteProductSpecifications(productId);
    
    // Then add new ones if any
    if (specifications && specifications.length > 0) {
      return await addProductSpecifications(productId, specifications);
    }
    
    return [];
  } catch (error) {
    console.error('Error in updateProductSpecifications:', error);
    throw error;
  }
}

// Update product
export async function updateProduct(productId, updates) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

// Delete product
export async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}

// Get all categories
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
}

// Get similar products by category (excluding current product)
export async function getSimilarProducts(productId, categoryId, limit = 4) {
  try {
    const { data, error } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('status', 'available')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching similar products:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    throw error;
  }
}

// Get user's favorite products
export async function getUserFavorites(userId) {
  try {
    // First get the product IDs from favorites table
    const { data: favoriteIds, error: favError } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (favError) {
      console.error('Error fetching favorite IDs:', favError);
      throw favError;
    }

    if (!favoriteIds || favoriteIds.length === 0) {
      return [];
    }

    // Extract product IDs
    const productIds = favoriteIds.map(fav => fav.product_id);

    // Get the actual product details
    const { data: products, error: productError } = await supabase
      .from('products_with_details')
      .select('*')
      .in('id', productIds)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (productError) {
      console.error('Error fetching favorite products:', productError);
      throw productError;
    }

    return products;
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    throw error;
  }
}

// Add a new category
export async function addCategory(categoryData) {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      throw new Error('You must be logged in to add categories');
    }

    console.log('Adding category:', categoryData);
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: categoryData.name,
        description: categoryData.description || null,
        icon_url: categoryData.icon_url || '/icons/others.svg',
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw new Error(error.message || 'Failed to add category');
    }

    console.log('Category added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
}

// Add product to favorites
export async function addToFavorites(userId, productId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        product_id: productId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }

    // Update the favorites count in products table
    const { error: updateError } = await supabase.rpc('increment_favorites_count', {
      product_id: productId
    });

    if (updateError) {
      console.error('Error updating favorites count:', updateError);
      // Don't throw here as the favorite was still added
    }

    return data;
  } catch (error) {
    console.error('Error in addToFavorites:', error);
    throw error;
  }
}

// Remove product from favorites
export async function removeFromFavorites(userId, productId) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }

    // Update the favorites count in products table
    const { error: updateError } = await supabase.rpc('decrement_favorites_count', {
      product_id: productId
    });

    if (updateError) {
      console.error('Error updating favorites count:', updateError);
      // Don't throw here as the favorite was still removed
    }

    return true;
  } catch (error) {
    console.error('Error in removeFromFavorites:', error);
    throw error;
  }
}

// Check if product is in user's favorites
export async function isProductFavorited(userId, productId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking if favorited:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isProductFavorited:', error);
    return false;
  }
}

// ============ RATING/REVIEW FUNCTIONS ============

// Add a review/rating for a seller
export async function addSellerReview(reviewData) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        reviewer_id: reviewData.reviewer_id,
        reviewed_user_id: reviewData.reviewed_user_id,
        product_id: reviewData.product_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      }])
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error adding seller review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addSellerReview:', error);
    throw error;
  }
}

// Get all reviews for a seller
export async function getSellerReviews(sellerId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
        product:products(title)
      `)
      .eq('reviewed_user_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller reviews:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSellerReviews:', error);
    return [];
  }
}

// Get seller rating summary
export async function getSellerRatingSummary(sellerId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('rating, total_ratings')
      .eq('id', sellerId)
      .single();

    if (error) {
      console.error('Error fetching seller rating summary:', error);
      throw error;
    }

    return {
      averageRating: data.rating || 0,
      totalRatings: data.total_ratings || 0
    };
  } catch (error) {
    console.error('Error in getSellerRatingSummary:', error);
    return { averageRating: 0, totalRatings: 0 };
  }
}

// Check if user has already reviewed a seller for a specific product
export async function hasUserReviewedSeller(reviewerId, sellerId, productId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', reviewerId)
      .eq('reviewed_user_id', sellerId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking if user reviewed seller:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in hasUserReviewedSeller:', error);
    return false;
  }
}

// ============ CREDIT SYSTEM FUNCTIONS ============

// Get user credits
export async function getUserCredits(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }

    return data.credits || 0;
  } catch (error) {
    console.error('Error in getUserCredits:', error);
    return 0;
  }
}

// Get credit packages
export async function getCreditPackages() {
  try {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('price');

    if (error) {
      console.error('Error fetching credit packages:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCreditPackages:', error);
    return [];
  }
}

// Deduct credits for posting a product
export async function deductCreditsForProduct(userId, productId, creditsToDeduct = 10) {
  try {
    // Start a transaction
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentCredits = userProfile.credits || 0;
    if (currentCredits < creditsToDeduct) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        credits: currentCredits - creditsToDeduct,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'spend',
        credits: -creditsToDeduct,
        description: `Credits spent for posting product`,
        product_id: productId
      });

    if (transactionError) throw transactionError;

    return { success: true, remainingCredits: currentCredits - creditsToDeduct };
  } catch (error) {
    console.error('Error in deductCreditsForProduct:', error);
    throw error;
  }
}

// Add credits to user account
export async function addCreditsToUser(userId, creditsToAdd, description = 'Credits added') {
  try {
    console.log(`Starting addCreditsToUser: userId=${userId}, creditsToAdd=${creditsToAdd}, description=${description}`);
    
    // Get current credits
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      throw fetchError;
    }

    if (!userProfile) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }

    const currentCredits = userProfile.credits || 0;
    const newCredits = currentCredits + creditsToAdd;
    
    console.log(`Credit calculation: ${currentCredits} + ${creditsToAdd} = ${newCredits}`);

    // Update credits in profiles table
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      throw updateError;
    }

    console.log('Credits updated in profiles table:', updateData);

    // Record transaction in credit_transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'purchase',
        credits: creditsToAdd,
        description: description,
        created_at: new Date().toISOString()
      })
      .select();

    if (transactionError) {
      console.error('Error creating credit transaction record:', transactionError);
      // Don't throw here - the credits were already added to the user
      console.warn('Credits were added to user but transaction record failed to create');
    } else {
      console.log('Credit transaction recorded:', transactionData);
    }

    return { success: true, newCredits, previousCredits: currentCredits };
  } catch (error) {
    console.error('Error in addCreditsToUser:', error);
    throw error;
  }
}

// Get user credit transactions
export async function getUserCreditTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select(`
        *,
        product:products(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credit transactions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserCreditTransactions:', error);
    return [];
  }
}

// Create payment transaction
export async function createPaymentTransaction(paymentData) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPaymentTransaction:', error);
    throw error;
  }
}

// Update payment transaction status
export async function updatePaymentTransactionStatus(transactionId, status, additionalData = {}) {
  try {
    const updateData = {
      payment_status: status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment transaction:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePaymentTransactionStatus:', error);
    throw error;
  }
}

// Get user payment transactions
export async function getUserPaymentTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        package:credit_packages(name, credits)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment transactions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPaymentTransactions:', error);
    return [];
  }
}

// Admin Functions for Manual Payment Review

// Get all pending manual payments for admin review
export async function getPendingManualPayments() {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .in('payment_method', ['manual', 'bank_transfer', 'mobile_banking', 'atm_deposit', 'cash_deposit'])
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending manual payments:', error);
      throw error;
    }

    console.log('Fetched pending payments:', data); // Debug log
    return data || [];
  } catch (error) {
    console.error('Error in getPendingManualPayments:', error);
    return [];
  }
}

// Approve manual payment (admin function)
export async function approveManualPayment(transactionId, adminNotes = '') {
  try {
    // Get transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError) throw fetchError;

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'completed',
        status: 'completed',
        admin_notes: adminNotes,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);    if (updateError) throw updateError;

    // Add credits to user account
    console.log(`Adding ${transaction.credits} credits to user ${transaction.user_id}`);
    try {
      const creditResult = await addCreditsToUser(
        transaction.user_id,
        transaction.credits,
        `Manual payment approved - ${transaction.package_name}`
      );
      console.log('Credits added successfully:', creditResult);
    } catch (creditError) {
      console.error('Failed to add credits to user:', creditError);
      throw new Error(`Payment approved but failed to add credits: ${creditError.message}`);
    }

    // Send notification to user (don't let notification failure stop payment approval)
    try {
      await createPaymentNotification(
        transaction.user_id,
        transactionId,
        'payment_approved',
        'Payment Approved! 🎉',
        `Your payment for ${transaction.package_name} (${transaction.credits} credits) has been approved and credits have been added to your account.`
      );
    } catch (notificationError) {
      console.warn('Failed to create approval notification, but payment was still approved:', notificationError);
    }

    return { success: true, message: 'Payment approved and credits added successfully' };
  } catch (error) {
    console.error('Error in approveManualPayment:', error);
    throw error;
  }
}

// Reject manual payment (admin function)
export async function rejectManualPayment(transactionId, rejectionReason = '') {
  try {
    // Get transaction details for notification
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'failed',
        status: 'rejected',
        admin_notes: rejectionReason,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) throw error;    // Send notification to user (don't let notification failure stop payment rejection)
    if (transaction) {
      try {
        await createPaymentNotification(
          transaction.user_id,
          transactionId,
          'payment_rejected',
          'Payment Rejected ❌',
          `Your payment for ${transaction.package_name} has been rejected. Reason: ${rejectionReason}. Please contact support if you have questions.`
        );
      } catch (notificationError) {
        console.warn('Failed to create rejection notification, but payment was still rejected:', notificationError);
      }
    }

    return { success: true, message: 'Payment rejected successfully' };
  } catch (error) {
    console.error('Error in rejectManualPayment:', error);
    throw error;
  }
}

// Get payment statistics for admin dashboard
export async function getPaymentStatistics() {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('payment_status, status, payment_method, amount, created_at');

    if (error) throw error;

    const stats = {
      total: data.length,
      completed: data.filter(t => t.payment_status === 'completed').length,
      pending: data.filter(t => t.payment_status === 'pending').length,
      pendingReview: data.filter(t => t.status === 'pending' && ['manual', 'bank_transfer', 'mobile_banking', 'atm_deposit', 'cash_deposit'].includes(t.payment_method)).length,
      failed: data.filter(t => t.payment_status === 'failed').length,
      totalRevenue: data
        .filter(t => t.payment_status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      paypalPayments: data.filter(t => t.payment_method === 'paypal').length,
      manualPayments: data.filter(t => ['manual', 'bank_transfer', 'mobile_banking', 'atm_deposit', 'cash_deposit'].includes(t.payment_method)).length
    };

    console.log('Payment statistics:', stats); // Debug log
    return stats;
  } catch (error) {
    console.error('Error in getPaymentStatistics:', error);
    throw error;
  }
}

// Notification System Functions

// Create payment notification
export async function createPaymentNotification(userId, paymentTransactionId, type, title, message) {
  try {
    // Use the service role or admin context for creating notifications
    const { data, error } = await supabase
      .from('payment_notifications')
      .insert({
        user_id: userId,
        payment_transaction_id: paymentTransactionId,
        notification_type: type,
        title: title,
        message: message,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Notification creation error:', error);
      // Log the specific error but don't throw it to prevent payment approval from failing
      console.warn(`Failed to create notification for user ${userId}: ${error.message}`);
      return null; // Return null instead of throwing to allow payment processing to continue
    }
    
    console.log('Notification created successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in createPaymentNotification:', error);
    // Don't throw the error - just log it so payment approval can continue
    return null;
  }
}

// Get user notifications
export async function getUserNotifications(userId, unreadOnly = false) {
  try {
    let query = supabase
      .from('payment_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('payment_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read for user
export async function markAllNotificationsAsRead(userId) {
  try {
    const { error } = await supabase
      .from('payment_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId) {
  try {
    const { count, error } = await supabase
      .from('payment_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}