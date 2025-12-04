import { supabase } from './supabase';

// Create donations table if it doesn't exist
export const createDonationsTable = async () => {
  const { error } = await supabase.rpc('create_donations_table');
  if (error) console.error('Error creating donations table:', error);
};

// Get all donations
export const getAllDonations = async () => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAllDonations:', error);
    throw error;
  }
};

// Add a new donation
export const addDonation = async (donationData) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert([{
        item_name: donationData.itemName,
        description: donationData.description,
        category: donationData.category,
        condition: donationData.condition,
        contact_name: donationData.contactName,
        contact_phone: donationData.contactPhone,
        contact_email: donationData.contactEmail,
        location: donationData.location,
        image_url: donationData.imageUrl || '/image/placeholder.jpg',
        status: 'available',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding donation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addDonation:', error);
    throw error;
  }
};

// Upload donation image
export const uploadDonationImage = async (file, donationId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${donationId}-${Date.now()}.${fileExt}`;
    const filePath = `donations/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('donation-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('donation-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadDonationImage:', error);
    throw error;
  }
};

// Update donation status (claimed, unavailable, etc.)
export const updateDonationStatus = async (donationId, status) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .update({ status })
      .eq('id', donationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateDonationStatus:', error);
    throw error;
  }
};

// Get donations by category
export const getDonationsByCategory = async (category) => {
  try {
    let query = supabase
      .from('donations')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching donations by category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getDonationsByCategory:', error);
    throw error;
  }
};

// Get a single donation by ID
export const getDonationById = async (donationId) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (error) {
      console.error('Error fetching donation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getDonationById:', error);
    throw error;
  }
};

// Get similar donations by category
export const getSimilarDonations = async (donationId, category, limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'available')
      .eq('category', category)
      .neq('id', donationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching similar donations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getSimilarDonations:', error);
    throw error;
  }
};

// Search donations
export const searchDonations = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'available')
      .or(`item_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching donations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in searchDonations:', error);
    throw error;
  }
};
