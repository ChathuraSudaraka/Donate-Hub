import { supabase } from './supabase';

/*------------------------------------------
  CREATE TABLE (if using Supabase RPC)
-------------------------------------------*/

// Create "requests" table via RPC (optional)
export const createRequestsTable = async () => {
  const { error } = await supabase.rpc('create_requests_table');
  if (error) console.error('Error creating requests table:', error);
};


/*------------------------------------------
  GET ALL REQUESTS
-------------------------------------------*/
export const getAllRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error in getAllRequests:', error);
    throw error;
  }
};


/*------------------------------------------
  ADD NEW REQUEST
-------------------------------------------*/
export const addRequest = async (requestData) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([
        {
          description: requestData.description,
          category: requestData.category,
          location: requestData.location,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding request:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error in addRequest:', error);
    throw error;
  }
};


/*------------------------------------------
  GET REQUEST BY ID
-------------------------------------------*/
export const getRequestById = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Error getting request by ID:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error in getRequestById:', error);
    throw error;
  }
};


/*------------------------------------------
  SEARCH REQUESTS
-------------------------------------------*/
export const searchRequests = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .or(`
        description.ilike.%${searchTerm}%,
        category.ilike.%${searchTerm}%,
        location.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching requests:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error in searchRequests:', error);
    throw error;
  }
};


/*------------------------------------------
  GET REQUESTS BY CATEGORY
-------------------------------------------*/
export const getRequestsByCategory = async (category) => {
  try {
    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching requests by category:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('Error in getRequestsByCategory:', error);
    throw error;
  }
};
