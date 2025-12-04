import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPendingManualPayments,
  approveManualPayment,
  rejectManualPayment,
  getPaymentStatistics
} from '../lib/productQueries';
import './PaymentComponents.css';

export default function AdminPaymentReview() {
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if user is admin
  const isAdmin = user?.email === 'admin@recyclehub.com' || 
                  user?.user_metadata?.role === 'admin' || 
                  user?.app_metadata?.role === 'admin';

  useEffect(() => {
    console.log('Current user:', user); // Debug log
    console.log('Is admin:', isAdmin); // Debug log
    
    if (isAdmin) {
      loadPaymentData();
    } else {
      setError('Access denied. Administrator privileges required.');
      setLoading(false);
    }
  }, [isAdmin]);
  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('Loading payment data...'); // Debug log
      
      const [payments, stats] = await Promise.all([
        getPendingManualPayments(),
        getPaymentStatistics()
      ]);
      
      console.log('Loaded payments:', payments); // Debug log
      console.log('Loaded stats:', stats); // Debug log
      
      setPendingPayments(payments);
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError('Failed to load payment data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (transactionId) => {
    try {
      setProcessing(transactionId);
      setError('');
      
      await approveManualPayment(transactionId, adminNotes);
      
      setSuccess('Payment approved successfully! Credits have been added to user account.');
      setAdminNotes('');
      setSelectedPayment(null);
      
      // Refresh data
      await loadPaymentData();
    } catch (err) {
      console.error('Error approving payment:', err);
      setError('Failed to approve payment: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectPayment = async (transactionId) => {
    try {
      setProcessing(transactionId);
      setError('');
      
      await rejectManualPayment(transactionId, rejectionReason);
      
      setSuccess('Payment rejected successfully.');
      setRejectionReason('');
      setShowRejectModal(false);
      setSelectedPayment(null);
      
      // Refresh data
      await loadPaymentData();
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError('Failed to reject payment: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };
  const openReceiptInNewTab = (receiptUrl) => {
    if (receiptUrl) {
      console.log('Opening receipt URL:', receiptUrl); // Debug log
      try {
        window.open(receiptUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Error opening receipt:', err);
        setError('Failed to open receipt. URL: ' + receiptUrl);
      }
    } else {
      console.log('No receipt URL provided'); // Debug log
      setError('No receipt available for this payment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return `LKR ${amount?.toLocaleString() || '0'}`;
  };

  if (loading) {
    return (
      <div className="admin-payment-review">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading payment reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payment-review">
      <div className="content-header">
        <h2>Payment Review Dashboard</h2>
        <p className="text-muted">Review and approve manual payment submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.pendingReview || 0}</h3>
              <p>Pending Review</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.completed || 0}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-info">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="stat-content">
              <h3>{formatAmount(statistics.totalRevenue)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon bg-primary">
              <i className="fas fa-upload"></i>
            </div>
            <div className="stat-content">
              <h3>{statistics.manualPayments || 0}</h3>
              <p>Manual Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}      {/* Pending Payments List */}
      <div className="admin-payments-container">
        <div className="payments-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="header-text">
              <h3>Pending Manual Payments</h3>
              <p className="subtitle">Review and process manual payment submissions</p>
            </div>
          </div>
          <div className="pending-count">
            <span className="count-badge">{pendingPayments.length}</span>
          </div>
        </div>

        <div className={`payments-content ${pendingPayments.length === 0 ? 'empty-state' : ''}`}>
          {pendingPayments.length === 0 ? (
            <div className="empty-payments-state">
              <div className="empty-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h4>All Payments Processed!</h4>
              <p>Great job! There are no pending manual payments to review at the moment.</p>
              <div className="empty-stats">
                <div className="stat-item">
                  <i className="fas fa-clipboard-check"></i>
                  <span>Ready for new submissions</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="payments-grid">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="user-details">
                        <h5 className="user-name">{payment.profiles?.full_name || 'Unknown User'}</h5>
                        <p className="payment-id">ID: #{payment.id}</p>
                      </div>
                    </div>
                    <div className="payment-timestamp">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{formatDate(payment.created_at)}</span>
                    </div>
                  </div>

                  <div className="payment-card-body">
                    <div className="payment-summary">
                      <div className="summary-row">
                        <div className="summary-item package">
                          <i className="fas fa-box"></i>
                          <div>
                            <span className="label">Package</span>
                            <strong>{payment.package_name}</strong>
                          </div>
                        </div>
                        <div className="summary-item credits">
                          <i className="fas fa-coins"></i>
                          <div>
                            <span className="label">Credits</span>
                            <strong>{payment.credits}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="summary-row">
                        <div className="summary-item amount">
                          <i className="fas fa-money-bill-wave"></i>
                          <div>
                            <span className="label">Amount</span>
                            <strong className="amount-value">{formatAmount(payment.amount)}</strong>
                          </div>
                        </div>
                        <div className="summary-item method">
                          <i className="fas fa-credit-card"></i>
                          <div>
                            <span className="label">Method</span>
                            <strong>{payment.payment_method}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="payment-details-section">
                      <div className="detail-row">
                        <span className="detail-label">Reference:</span>
                        <span className="detail-value reference-number">{payment.reference_number}</span>
                      </div>
                      {payment.notes && (
                        <div className="detail-row notes">
                          <span className="detail-label">User Notes:</span>
                          <p className="detail-value user-notes">{payment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="payment-card-actions">
                    {payment.receipt_url && (
                      <button
                        className="btn btn-receipt"
                        onClick={() => openReceiptInNewTab(payment.receipt_url)}
                      >
                        <i className="fas fa-receipt"></i>
                        <span>View Receipt</span>
                      </button>
                    )}
                    
                    <div className="admin-notes-input">
                      <label className="notes-label">
                        <i className="fas fa-sticky-note"></i>
                        Admin Notes
                      </label>
                      <textarea
                        className="notes-textarea"
                        rows="3"
                        value={selectedPayment === payment.id ? adminNotes : ''}
                        onChange={(e) => {
                          setSelectedPayment(payment.id);
                          setAdminNotes(e.target.value);
                        }}
                        placeholder="Add your review notes here..."
                      />
                    </div>
                    
                    <div className="action-buttons-row">
                      <button
                        className="btn btn-approve"
                        onClick={() => handleApprovePayment(payment.id)}
                        disabled={processing === payment.id}
                      >
                        {processing === payment.id ? (
                          <>
                            <div className="btn-spinner"></div>
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle"></i>
                            <span>Approve Payment</span>
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => {
                          setSelectedPayment(payment.id);
                          setShowRejectModal(true);
                        }}
                        disabled={processing === payment.id}                      >
                        <i className="fas fa-times-circle"></i>
                        <span>Reject Payment</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Rejection Reason *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this payment..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRejectPayment(selectedPayment)}
                  disabled={!rejectionReason.trim() || processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Rejecting...
                    </>
                  ) : (
                    'Reject Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
