import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdminDashboardTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results = {};
    
    try {
      // Test 1: Check user info
      results.userInfo = {
        id: user?.id,
        email: user?.email,
        userMetadata: user?.user_metadata,
        appMetadata: user?.app_metadata
      };

      // Test 2: Check if we can query payment_transactions
      try {
        const { data: payments, error: paymentsError } = await supabase
          .from('payment_transactions')
          .select('id, payment_method, status, created_at')
          .limit(5);
        
        results.paymentsQuery = {
          success: !paymentsError,
          error: paymentsError?.message,
          count: payments?.length || 0,
          data: payments
        };
      } catch (err) {
        results.paymentsQuery = {
          success: false,
          error: err.message
        };
      }

      // Test 3: Check manual payments specifically
      try {
        const { data: manualPayments, error: manualError } = await supabase
          .from('payment_transactions')
          .select('*')
          .in('payment_method', ['manual', 'bank_transfer', 'mobile_banking', 'atm_deposit', 'cash_deposit'])
          .eq('status', 'pending');
        
        results.manualPaymentsQuery = {
          success: !manualError,
          error: manualError?.message,
          count: manualPayments?.length || 0,
          data: manualPayments
        };
      } catch (err) {
        results.manualPaymentsQuery = {
          success: false,
          error: err.message
        };
      }

      // Test 4: Check storage access
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        results.storageQuery = {
          success: !bucketsError,
          error: bucketsError?.message,
          buckets: buckets?.map(b => b.name) || []
        };
      } catch (err) {
        results.storageQuery = {
          success: false,
          error: err.message
        };
      }

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  if (loading) {
    return <div>Running tests...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Admin Dashboard Test Results</h3>
      <pre>{JSON.stringify(testResults, null, 2)}</pre>
      
      <button onClick={runTests} style={{ marginTop: '20px', padding: '10px' }}>
        Run Tests Again
      </button>
    </div>
  );
}
