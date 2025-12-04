import { supabase } from './supabase';

// Storage bucket name for product images
const PRODUCT_IMAGES_BUCKET = 'product-images';

/**
 * Upload a single image to Supabase storage
 * @param {File} file - The image file to upload
 * @param {string} fileName - Custom filename (optional)
 * @returns {Promise<{url: string, path: string} | null>}
 */
export async function uploadImage(file, fileName = null) {
  try {
    // Generate unique filename if not provided
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

/**
 * Upload multiple images for a product
 * @param {FileList} files - Array of image files
 * @param {number} productId - Product ID for organizing images
 * @returns {Promise<Array<{url: string, path: string}>>}
 */
export async function uploadProductImages(files, productId) {
  try {
    const uploadPromises = Array.from(files).map(async (file, index) => {
      const fileName = `product-${productId}-${index}-${Date.now()}.${file.name.split('.').pop()}`;
      return await uploadImage(file, fileName);
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(result => result !== null);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return [];
  }
}

/**
 * Delete an image from Supabase storage
 * @param {string} imagePath - Path to the image in storage
 * @returns {Promise<boolean>}
 */
export async function deleteImage(imagePath) {
  try {
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
}

/**
 * Update product images in database after upload
 * @param {number} productId - Product ID
 * @param {Array<{url: string, path: string}>} imageData - Array of image data
 * @returns {Promise<boolean>}
 */
export async function saveProductImagesToDB(productId, imageData) {
  try {
    // First, delete existing images for this product
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Error deleting existing images:', deleteError);
    }

    // Insert new images
    const imageRecords = imageData.map((image, index) => ({
      product_id: productId,
      image_url: image.url,
      is_primary: index === 0, // First image is primary
      display_order: index,
      alt_text: `Product image ${index + 1}`
    }));

    const { error: insertError } = await supabase
      .from('product_images')
      .insert(imageRecords);

    if (insertError) {
      console.error('Error inserting image records:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveProductImagesToDB:', error);
    return false;
  }
}

/**
 * Compress image before upload (optional)
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<File>}
 */
export async function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB to match UI text
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload images smaller than 10MB.'
    };
  }

  return { valid: true };
}

/**
 * Process URL images for a product
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {number} productId - Product ID for organizing images
 * @returns {Promise<Array<{url: string, path: string}>>}
 */
export async function processProductImageUrls(imageUrls, productId) {
  try {
    const validUrls = imageUrls.filter(url => url && url.trim());
    
    return validUrls.map((url, index) => ({
      url: url.trim(),
      path: `url-${productId}-${index}-${Date.now()}` // Unique identifier for URL images
    }));
  } catch (error) {
    console.error('Error processing image URLs:', error);
    return [];
  }
}

/**
 * Combine file uploads and URL images for a product
 * @param {FileList} files - Array of image files to upload
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {number} productId - Product ID for organizing images
 * @returns {Promise<Array<{url: string, path: string}>>}
 */
export async function processAllProductImages(files, imageUrls, productId) {
  try {
    const uploadPromises = [];
    
    // Process file uploads
    if (files && files.length > 0) {
      const uploadedFiles = await uploadProductImages(files, productId);
      uploadPromises.push(...uploadedFiles);
    }
    
    // Process URL images
    if (imageUrls && imageUrls.length > 0) {
      const urlImages = await processProductImageUrls(imageUrls, productId);
      uploadPromises.push(...urlImages);
    }
    
    return uploadPromises;
  } catch (error) {
    console.error('Error processing all product images:', error);
    return [];
  }
}
