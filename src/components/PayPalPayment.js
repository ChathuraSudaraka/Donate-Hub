import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createPaymentTransaction, 
  updatePaymentTransactionStatus,
  addCreditsToUser 
} from '../lib/productQueries';
import './PaymentComponents.css';

export default function PayPalPayment({ creditPackage, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      script.onerror = () => setError('Failed to load PayPal SDK');
      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, []);

  // Initialize PayPal Buttons
  useEffect(() => {
    if (paypalLoaded && creditPackage && window.paypal) {
      const paypalButtonContainer = document.getElementById('paypal-button-container');
      if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = ''; // Clear existing buttons
      }

      window.paypal.Buttons({
        createOrder: async (data, actions) => {
          setIsLoading(true);
          setError('');

          try {            // Create payment transaction record
            const paymentData = {
              user_id: user.id,
              payment_method: 'paypal',
              amount: creditPackage.price,
              currency: 'LKR',
              credits: creditPackage.credits,
              package_name: creditPackage.name,
              payment_status: 'pending', // Use payment_status instead of status
              status: 'pending' // Keep both for compatibility
            };

            const paymentTransaction = await createPaymentTransaction(paymentData);
            
            // Convert LKR to USD (approximate conversion - you should use a real exchange rate API)
            const usdAmount = (creditPackage.price / 300).toFixed(2); // Rough conversion

            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: usdAmount,
                  currency_code: 'USD'
                },
                description: `${creditPackage.name} - ${creditPackage.credits} Credits`,
                custom_id: paymentTransaction.id.toString()
              }]
            });
          } catch (err) {
            setError('Failed to create payment order');
            setIsLoading(false);
            throw err;
          }
        },        onApprove: async (data, actions) => {
          try {
            const order = await actions.order.capture();
            const paymentTransactionId = order.purchase_units[0].custom_id;

            console.log('PayPal payment captured:', order.id);

            // Update payment transaction status to completed (automatic for PayPal)
            await updatePaymentTransactionStatus(paymentTransactionId, 'completed', {
              paypal_order_id: order.id,
              payer_email: order.payer.email_address,
              transaction_id: order.purchase_units[0].payments.captures[0].id,
              status: 'completed' // Auto-approve PayPal payments
            });

            console.log('Payment transaction updated to completed');

            // Add credits to user account immediately
            await addCreditsToUser(
              user.id, 
              creditPackage.credits, 
              `Purchased ${creditPackage.name} via PayPal - Order: ${order.id}`
            );

            console.log('Credits added to user account');

            setIsLoading(false);
            onSuccess && onSuccess({
              orderId: order.id,
              credits: creditPackage.credits,
              amount: creditPackage.price,
              status: 'completed'
            });

          } catch (err) {
            console.error('PayPal payment completion error:', err);
            
            // Try to update the transaction status to failed
            try {
              const paymentTransactionId = data.orderID;
              await updatePaymentTransactionStatus(paymentTransactionId, 'failed', {
                error_message: err.message,
                status: 'failed'
              });
            } catch (updateErr) {
              console.error('Failed to update transaction status:', updateErr);
            }
            
            setError('Payment was processed but there was an error updating your account. Please contact support with Order ID: ' + data.orderID);
            setIsLoading(false);
          }
        },

        onError: (err) => {
          console.error('PayPal error:', err);
          setError('PayPal payment failed. Please try again.');
          setIsLoading(false);
        },

        onCancel: (data) => {
          console.log('PayPal payment cancelled:', data);
          setIsLoading(false);
          onCancel && onCancel();
        }
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, creditPackage, user]);

  if (!creditPackage) {
    return (
      <div className="text-center text-muted py-4">
        <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
        <p>Please select a credit package first</p>
      </div>
    );
  }

  return (
    <div className="paypal-payment-container">
      <div className="payment-summary mb-3">
        <h6>Payment Summary</h6>
        <div className="d-flex justify-content-between">
          <span>Package:</span>
          <span>{creditPackage.name}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Credits:</span>
          <span>{creditPackage.credits}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold">
          <span>Total:</span>
          <span>LKR {creditPackage.price.toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-sm mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center mb-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Processing...</span>
          </div>
          <div className="mt-2">
            <small className="text-muted">Processing payment...</small>
          </div>
        </div>
      )}

      <div id="paypal-button-container" style={isLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}}></div>

      {!paypalLoaded && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading PayPal...</span>
          </div>
          <div className="mt-2">
            <small className="text-muted">Loading PayPal payment system...</small>
          </div>
        </div>
      )}
    </div>
  );
}
