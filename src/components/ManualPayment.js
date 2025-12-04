import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  createPaymentTransaction,
  createPaymentNotification,
} from "../lib/productQueries";
import { supabase } from "../lib/supabase";
import "./PaymentComponents.css";

export default function ManualPayment({ creditPackage, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    referenceNumber: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG, GIF) or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const uploadFile = async (file, transactionId) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `payment_receipts/${user.id}/${transactionId}.${fileExt}`;

    console.log('Uploading file:', fileName); // Debug log

    const { data, error } = await supabase.storage
      .from("payment-receipts")
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket not configured. Please contact the administrator to set up the payment receipt storage.');
      }
      throw error;
    }

    console.log('Upload successful:', data); // Debug log

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("payment-receipts")
      .getPublicUrl(fileName);

    console.log('Receipt URL:', urlData.publicUrl); // Debug log
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please upload a payment receipt");
      return;
    }

    if (!paymentDetails.referenceNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create payment transaction record for manual review
      const paymentData = {
        user_id: user.id,
        payment_method: paymentDetails.paymentMethod,
        amount: creditPackage.price,
        currency: "LKR",
        credits: creditPackage.credits,        package_name: creditPackage.name,
        payment_status: "pending", // Pending until admin review
        status: "pending",
        reference_number: paymentDetails.referenceNumber,
        notes: paymentDetails.notes,
      };

      const paymentTransaction = await createPaymentTransaction(paymentData);

      // Upload receipt file
      const receiptUrl = await uploadFile(selectedFile, paymentTransaction.id);

      // Update transaction with receipt URL
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({ receipt_url: receiptUrl })
        .eq("id", paymentTransaction.id);

      if (updateError) throw updateError;

      // Send notification to user about payment submission
      await createPaymentNotification(
        user.id,
        paymentTransaction.id,
        "payment_pending",
        "Payment Submitted for Review 📋",
        `Your manual payment for ${creditPackage.name} (${creditPackage.credits} credits) has been submitted for admin review. You will be notified once the review is complete.`
      );

      setSuccess(
        "Payment receipt uploaded successfully! Your payment is under admin review and credits will be added once approved. You will be notified via email when the review is complete."
      );

      // Reset form
      setSelectedFile(null);
      setPreviewUrl("");
      setPaymentDetails({
        referenceNumber: "",
        paymentMethod: "bank_transfer",
        notes: "",
      });

      // Call success callback after delay
      setTimeout(() => {
        onSuccess &&
          onSuccess({
            transactionId: paymentTransaction.id,
            status: "pending_review",
            message: "Payment submitted for admin review",
          });
      }, 2000);
    } catch (err) {
      console.error("Manual payment submission error:", err);
      setError("Failed to submit payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!creditPackage) {
    return (
      <div className="text-center text-muted py-4">
        <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
        <p>Please select a credit package first</p>
      </div>
    );
  }

  return (
    <div className="manual-payment-container">
      <div className="payment-summary mb-4">
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

      <div className="bank-details mb-4">
        <h6>
          <i className="fas fa-university me-2"></i>Bank Details
        </h6>
        <div className="bank-info">
          <div className="bank-item">
            <strong>Bank:</strong> Commercial Bank of Ceylon
          </div>
          <div className="bank-item">
            <strong>Account Name:</strong> Recycle Hub Lanka (Pvt) Ltd
          </div>
          <div className="bank-item">
            <strong>Account Number:</strong> 8001234567890
          </div>
          <div className="bank-item">
            <strong>Branch:</strong> Colombo Main
          </div>
        </div>
        <div className="alert alert-info mt-3">
          <i className="fas fa-info-circle me-2"></i>
          Please transfer the exact amount and upload your receipt below.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select
            name="paymentMethod"
            className="form-select"
            value={paymentDetails.paymentMethod}
            onChange={handleInputChange}
            required
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_banking">Mobile Banking</option>
            <option value="atm_deposit">ATM Deposit</option>
            <option value="cash_deposit">Cash Deposit</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Reference Number *</label>
          <input
            type="text"
            name="referenceNumber"
            className="form-control"
            value={paymentDetails.referenceNumber}
            onChange={handleInputChange}
            placeholder="Enter transaction reference number"
            required
          />
          <small className="form-text text-muted">
            Enter the reference number from your bank receipt
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Receipt *</label>
          <input
            type="file"
            className="form-control"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            required
          />
          <small className="form-text text-muted">
            Upload your payment receipt (JPG, PNG, GIF, or PDF, max 5MB)
          </small>
        </div>

        {previewUrl && (
          <div className="mb-3">
            <label className="form-label">Preview</label>
            <div className="receipt-preview">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="img-fluid rounded"
                style={{ maxHeight: "200px" }}
              />
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Additional Notes (Optional)</label>
          <textarea
            name="notes"
            className="form-control"
            rows="3"
            value={paymentDetails.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes about the payment..."
          ></textarea>
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-upload me-2"></i>
                Submit Payment
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
