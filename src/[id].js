import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  getSimilarProducts,
  addToFavorites,
  removeFromFavorites,
  isProductFavorited,
  addSellerReview,
  getSellerReviews,
  getSellerRatingSummary,
  hasUserReviewedSeller,
} from "./lib/productQueries";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import toast, { Toaster } from "react-hot-toast";
import "./ProductSingle.css";

export default function ProductSingle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [sellerRatings, setSellerRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(parseInt(id));
        setProduct(productData);

        // Fetch similar products
        if (productData?.category_id) {
          const similar = await getSimilarProducts(
            productData.id,
            productData.category_id
          );
          setSimilarProducts(similar);
        }

        // Check if product is favorited (only if user is logged in)
        if (user && productData) {
          const favorited = await isProductFavorited(user.id, productData.id);
          setIsFavorited(favorited);
        }

        // Fetch seller ratings and reviews
        if (productData?.seller_id) {
          const [ratingSummary, reviews] = await Promise.all([
            getSellerRatingSummary(productData.seller_id),
            getSellerReviews(productData.seller_id),
          ]);

          setAverageRating(ratingSummary.averageRating);
          setTotalRatings(ratingSummary.totalRatings);
          setSellerRatings(reviews);

          // Check if current user has already reviewed this seller for this product
          if (user && user.id !== productData.seller_id) {
            const hasReviewedSeller = await hasUserReviewedSeller(
              user.id,
              productData.seller_id,
              productData.id
            );
            setHasReviewed(hasReviewedSeller);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user]);

  const handleImageChange = (index) => {
    setSelectedImage(index);
  };
  const handleContactSeller = () => {
    if (product?.seller_phone) {
      window.open(`tel:${product.seller_phone}`);
    }
  };
  const handleWhatsApp = () => {
    if (product?.seller_phone) {
      const message = `Hi! I'm interested in your ${
        product.title
      } listed on Recycle Hub for LKR ${product.price.toLocaleString()}`;

      // Clean the phone number and format for WhatsApp
      let phoneNumber = product.seller_phone.replace(/[^0-9]/g, "");

      // If it's a Sri Lankan number starting with 0, convert to international format
      if (phoneNumber.startsWith("0") && phoneNumber.length === 10) {
        phoneNumber = "94" + phoneNumber.substring(1); // Replace 0 with 94
      }
      // If it already starts with 94, use as is
      else if (phoneNumber.startsWith("94")) {
        phoneNumber = phoneNumber;
      }
      // If it doesn't start with 0 or 94, assume it needs 94 prefix
      else if (phoneNumber.length === 9) {
        phoneNumber = "94" + phoneNumber;
      }

      window.open(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      );
    }
  };
  const handleAddToFavorites = async () => {
    if (!user) {
      toast.error("Please login to add items to favorites!");
      navigate("/Login");
      return;
    }

    if (!product) return;

    try {
      setFavoritesLoading(true);

      if (isFavorited) {
        // Remove from favorites
        await removeFromFavorites(user.id, product.id);
        setIsFavorited(false);

        // Update the local favorites count
        setProduct((prev) => ({
          ...prev,
          favorites_count: Math.max(0, (prev.favorites_count || 0) - 1),
        }));

        toast.success("Removed from favorites!", {
          icon: "💔",
          duration: 3000,
        });
      } else {
        // Add to favorites
        await addToFavorites(user.id, product.id);
        setIsFavorited(true);

        // Update the local favorites count
        setProduct((prev) => ({
          ...prev,
          favorites_count: (prev.favorites_count || 0) + 1,
        }));

        toast.success("Added to favorites!", {
          icon: "❤️",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setFavoritesLoading(false);
    }
  };
  const handleBuyNow = () => {
    // Buy now logic here
    toast.success(`Proceeding to buy ${quantity} x ${product.title}`, {
      icon: "🛒",
      duration: 4000,
    });
  };
  const handleRateSeller = () => {
    if (!user) {
      toast.error("Please login to rate sellers!");
      navigate("/Login");
      return;
    }

    if (user.id === product.seller_id) {
      toast.error("You cannot rate yourself!");
      return;
    }

    if (hasReviewed) {
      toast.error("You have already reviewed this seller for this product!");
      return;
    }

    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (userRating === 0) {
      toast.error("Please select a rating!");
      return;
    }

    if (!ratingComment.trim()) {
      toast.error("Please add a comment!");
      return;
    }

    setRatingLoading(true);

    try {
      const reviewData = {
        reviewer_id: user.id,
        reviewed_user_id: product.seller_id,
        product_id: product.id,
        rating: userRating,
        comment: ratingComment.trim(),
      };

      const newReview = await addSellerReview(reviewData);

      // Update local state
      setSellerRatings((prev) => [newReview, ...prev]);
      setHasReviewed(true);

      // Refresh rating summary
      const ratingSummary = await getSellerRatingSummary(product.seller_id);
      setAverageRating(ratingSummary.averageRating);
      setTotalRatings(ratingSummary.totalRatings);

      // Reset form
      setUserRating(0);
      setRatingComment("");
      setShowRatingModal(false);

      toast.success("Rating submitted successfully!", {
        icon: "⭐",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error submitting rating:", err);
      toast.error("Failed to submit rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${
            i <= rating ? "text-warning" : "text-muted"
          } ${interactive ? "rating-star-interactive" : ""}`}
          onClick={
            interactive && onStarClick ? () => onStarClick(i) : undefined
          }
          style={{ cursor: interactive ? "pointer" : "default" }}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/Buy")} className="btn btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <button onClick={() => navigate("/Buy")} className="btn btn-primary">
          Back to Products
        </button>
      </div>
    );
  }
  return (
    <div
      className={`product-single-container ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      <div className="container">
        {" "}
        <nav className="breadcrumb-nav">
          <span onClick={() => navigate("/")} className="breadcrumb-link">
            Home
          </span>{" "}
          /
          <span onClick={() => navigate("/Buy")} className="breadcrumb-link">
            Buy
          </span>{" "}
          /
          <span
            onClick={() => navigate(`/${product.category_name}`)}
            className="breadcrumb-link"
          >
            {product.category_name}
          </span>{" "}
          /<span className="breadcrumb-current">{product.title}</span>
        </nav>
        <div className="row">
          {/* Product Images */}{" "}
          <div className="col-md-6">
            <div className="product-images">
              <div className="main-image">
                {" "}
                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[selectedImage]?.image_url ||
                        product.primary_image
                      : product.primary_image || "/image/placeholder.svg"
                  }
                  alt={product.title}
                  className="main-product-image"
                  onError={(e) => {
                    e.target.src = "/image/placeholder.svg";
                  }}
                />
                <div className="image-badges">
                  {product.is_negotiable && (
                    <span className="badge badge-negotiable">Negotiable</span>
                  )}
                  <span
                    className={`badge badge-condition ${product.condition?.toLowerCase()}`}
                  >
                    {product.condition}
                  </span>
                </div>
              </div>
              {product.images && product.images.length > 0 && (
                <div className="image-thumbnails">
                  {product.images.map((image, index) => (
                    <img
                      key={image.id || index}
                      src={image.image_url}
                      alt={image.alt_text || `${product.title} ${index + 1}`}
                      className={`thumbnail ${
                        selectedImage === index ? "active" : ""
                      }`}
                      onError={(e) => {
                        e.target.src = "/image/placeholder.svg";
                      }}
                      onClick={() => handleImageChange(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Product Details */}{" "}
          <div className="col-md-6">
            <div className="product-details">
              <div className="product-header">
                <h1 className="product-title">{product.title}</h1>
                <div className="product-meta">
                  <span className="views">👁 {product.views || 0} views</span>
                  <span className="favorites">
                    ❤ {product.favorites_count || 0} favorites
                  </span>
                  <span className="date">
                    📅 {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="pricing">
                <div className="current-price">
                  LKR {product.price?.toLocaleString()}
                </div>
                {product.original_price &&
                  product.original_price > product.price && (
                    <div className="original-price">
                      Original: LKR {product.original_price.toLocaleString()}
                      <span className="discount">
                        (
                        {Math.round(
                          (1 - product.price / product.original_price) * 100
                        )}
                        % off)
                      </span>
                    </div>
                  )}
              </div>
              <div className="product-info">
                <div className="info-item">
                  <strong>Category:</strong> {product.category_name}
                </div>
                <div className="info-item">
                  <strong>Condition:</strong> {product.condition}
                </div>
                <div className="info-item">
                  <strong>Location:</strong>{" "}
                  {product.location || product.seller_location}
                </div>
              </div>
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="action-buttons">
                <button onClick={handleBuyNow} className="btn btn-buy-now">
                  🛒 Buy Now
                </button>
                <button
                  onClick={handleContactSeller}
                  className="btn btn-contact"
                >
                  📞 Call Seller
                </button>
                <button onClick={handleWhatsApp} className="btn btn-whatsapp">
                  💬 WhatsApp
                </button>{" "}
                <button
                  onClick={handleAddToFavorites}
                  className={`btn ${
                    isFavorited ? "btn-favorited" : "btn-favorite"
                  }`}
                  disabled={favoritesLoading}
                >
                  {favoritesLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Loading...
                    </>
                  ) : isFavorited ? (
                    <>
                      <i className="fas fa-heart"></i> Remove from Favorites
                    </>
                  ) : (
                    <>
                      <i className="far fa-heart"></i> Add to Favorites
                    </>
                  )}
                </button>
              </div>{" "}
              {/* Seller Information */}
              <div className="seller-info">
                <h3>Seller Information</h3>
                <div className="seller-card">
                  <div className="seller-details">
                    <div className="seller-header">
                      <div className="seller-avatar">
                        {product.seller_avatar_url ? (
                          <img
                            src={product.seller_avatar_url}
                            alt={product.seller_name}
                            className="avatar-image"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {(product.seller_name || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="seller-info-content">
                        <div className="seller-name">
                          {product.seller_name || "Anonymous Seller"}
                          {product.seller_is_verified && (
                            <span
                              className="verified-badge"
                              title="Verified Seller"
                            >
                              <i className="fas fa-check-circle"></i>
                            </span>
                          )}
                        </div>{" "}
                        {averageRating > 0 && (
                          <div className="seller-rating">
                            <div className="stars">
                              {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="rating-text">
                              ({averageRating.toFixed(1)}/5)
                            </span>
                            {totalRatings > 0 && (
                              <span className="rating-count">
                                {totalRatings} review
                                {totalRatings !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="seller-contact-info">
                      <div className="contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>
                          {product.seller_location ||
                            product.location ||
                            "Location not specified"}
                        </span>
                      </div>

                      {product.seller_phone && (
                        <div className="contact-item">
                          <i className="fas fa-phone"></i>
                          <span>{product.seller_phone}</span>
                        </div>
                      )}

                      {product.seller_email && (
                        <div className="contact-item">
                          <i className="fas fa-envelope"></i>
                          <span>{product.seller_email}</span>
                        </div>
                      )}
                    </div>

                    {product.seller_bio && (
                      <div className="seller-bio">
                        <h4>About the Seller</h4>
                        <p>{product.seller_bio}</p>
                      </div>
                    )}

                    <div className="seller-actions">
                      <button
                        onClick={handleContactSeller}
                        className="btn btn-contact-seller"
                        disabled={!product.seller_phone}
                      >
                        <i className="fas fa-phone"></i>
                        Call Seller
                      </button>{" "}
                      <button
                        onClick={handleWhatsApp}
                        className="btn btn-whatsapp-seller"
                        disabled={!product.seller_phone}
                      >
                        <i className="fab fa-whatsapp"></i>
                        WhatsApp
                      </button>{" "}
                      {user &&
                        user.id !== product.seller_id &&
                        !hasReviewed && (
                          <button
                            onClick={handleRateSeller}
                            className="btn btn-rate-seller"
                          >
                            <i className="fas fa-star"></i>
                            Rate Seller
                          </button>
                        )}
                      {hasReviewed && (
                        <span className="already-reviewed-text">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          You have reviewed
                        </span>
                      )}
                    </div>

                    {/* Seller Ratings Section */}
                    <div className="seller-ratings-section mt-4">
                      <div className="ratings-header">
                        <h4>
                          <i className="fas fa-star text-warning me-2"></i>
                          Seller Ratings
                        </h4>
                        {averageRating > 0 && (
                          <div className="average-rating">
                            <div className="rating-stars">
                              {renderStars(Math.round(averageRating))}
                            </div>{" "}
                            <span className="rating-value">
                              {averageRating.toFixed(1)} ({totalRatings} review
                              {totalRatings !== 1 ? "s" : ""})
                            </span>
                          </div>
                        )}
                      </div>{" "}
                      {sellerRatings.length > 0 ? (
                        <div className="ratings-list">
                          {sellerRatings.slice(0, 3).map((rating) => (
                            <div key={rating.id} className="rating-item">
                              <div className="rating-header">
                                <div className="rating-user">
                                  <strong>
                                    {rating.reviewer?.full_name ||
                                      rating.user_name ||
                                      "Anonymous User"}
                                  </strong>
                                  <div className="rating-stars small">
                                    {renderStars(rating.rating)}
                                  </div>
                                </div>
                                <small className="rating-date text-muted">
                                  {new Date(
                                    rating.created_at
                                  ).toLocaleDateString()}
                                </small>
                              </div>
                              <p className="rating-comment">{rating.comment}</p>
                              {rating.product?.title && (
                                <small className="text-muted">
                                  <i className="fas fa-box me-1"></i>
                                  Product: {rating.product.title}
                                </small>
                              )}
                            </div>
                          ))}
                          {sellerRatings.length > 3 && (
                            <div className="text-center">
                              <button className="btn btn-outline-primary btn-sm">
                                View All Reviews ({sellerRatings.length})
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="no-ratings">
                          <p className="text-muted">
                            <i className="fas fa-star-o me-2"></i>
                            No ratings yet. Be the first to rate this seller!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Product Description */}
        <div className="row">
          <div className="col-12">
            <div className="product-section">
              <h2>Description</h2>
              <p className="product-description">{product.description}</p>
            </div>
          </div>
        </div>{" "}
        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="product-section">
                <h2>Specifications</h2>
                <div className="specifications-grid">
                  {product.specifications.map((spec) => (
                    <div key={spec.id} className="spec-item">
                      <span className="spec-label">{spec.spec_name}:</span>
                      <span className="spec-value">{spec.spec_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="product-section">
                <h2>
                  <i className="fas fa-layer-group me-2"></i>
                  Similar Products
                </h2>
                <div className="row g-3">
                  {similarProducts.map((similarProduct) => (
                    <div
                      key={similarProduct.id}
                      className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
                    >
                      <div
                        className="card similar-product-card h-100 shadow-sm"
                        onClick={() =>
                          navigate(`/product/${similarProduct.id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div className="position-relative overflow-hidden">
                          <img
                            src={
                              similarProduct.primary_image ||
                              "/image/placeholder.svg"
                            }
                            alt={similarProduct.title}
                            className="card-img-top similar-product-image"
                            onError={(e) => {
                              e.target.src = "/image/placeholder.svg";
                            }}
                          />
                          <div className="condition-badge position-absolute top-0 end-0 m-2">
                            {similarProduct.condition}
                          </div>
                          <div className="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <button className="btn btn-primary btn-sm opacity-0">
                              <i className="fas fa-eye me-1"></i>
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="card-body d-flex flex-column">
                          <h6
                            className="card-title mb-2"
                            title={similarProduct.title}
                          >
                            {similarProduct.title.length > 50
                              ? similarProduct.title.substring(0, 50) + "..."
                              : similarProduct.title}
                          </h6>
                          <div className="mt-auto">
                            <div className="price-section mb-2">
                              <div className="current-price fw-bold text-primary">
                                LKR {similarProduct.price?.toLocaleString()}
                              </div>
                              {similarProduct.original_price &&
                                similarProduct.original_price >
                                  similarProduct.price && (
                                  <div className="original-price text-muted text-decoration-line-through small">
                                    LKR{" "}
                                    {similarProduct.original_price?.toLocaleString()}
                                  </div>
                                )}
                            </div>
                            <div className="product-meta">
                              <div className="d-flex justify-content-between align-items-center text-muted small">
                                <span>
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  {similarProduct.location &&
                                  similarProduct.location.length > 15
                                    ? similarProduct.location.substring(0, 15) +
                                      "..."
                                    : similarProduct.location ||
                                      "Not specified"}
                                </span>
                                <span>
                                  <i className="fas fa-eye me-1"></i>
                                  {similarProduct.views || 0}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center text-muted small mt-1">
                                <span>
                                  <i className="fas fa-heart me-1"></i>
                                  {similarProduct.favorites_count || 0}
                                </span>
                                <span>
                                  {new Date(
                                    similarProduct.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {similarProducts.length > 8 && (
                  <div className="text-center mt-4">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        navigate(`/category/${product.category_name}`)
                      }
                    >
                      <i className="fas fa-th-large me-2"></i>
                      View All {product.category_name} Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRatingModal(false)}
        >
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                <i className="fas fa-star text-warning me-2"></i>
                Rate Seller
              </h4>
              <button
                className="close-btn"
                onClick={() => setShowRatingModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="seller-info-mini">
                <div className="seller-avatar-small">
                  {product.seller_avatar_url ? (
                    <img
                      src={product.seller_avatar_url}
                      alt={product.seller_name}
                    />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {(product.seller_name || "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <strong>{product.seller_name || "Anonymous Seller"}</strong>
                  <p className="text-muted small">
                    Rate your experience with this seller
                  </p>
                </div>
              </div>

              <div className="rating-input">
                <label>Your Rating *</label>
                <div className="stars-input">
                  {renderStars(userRating, true, setUserRating)}
                </div>
                <small className="form-text text-muted">
                  {userRating === 1 && "Poor"}
                  {userRating === 2 && "Fair"}
                  {userRating === 3 && "Good"}
                  {userRating === 4 && "Very Good"}
                  {userRating === 5 && "Excellent"}
                  {userRating === 0 && "Click a star to rate"}
                </small>
              </div>

              <div className="comment-input">
                <label>Your Review *</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  rows="4"
                  className="form-control"
                  maxLength="500"
                />
                <small className="form-text text-muted">
                  {ratingComment.length}/500 characters
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRatingModal(false)}
                disabled={ratingLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitRating}
                disabled={
                  ratingLoading || userRating === 0 || !ratingComment.trim()
                }
              >
                {ratingLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-star me-2"></i>
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? "var(--bg-secondary)" : "#fff",
            color: isDark ? "var(--text-primary)" : "#333",
            border: isDark
              ? "1px solid var(--border-color)"
              : "1px solid #e2e8f0",
          },
          success: {
            style: {
              background: isDark ? "var(--green-dark)" : "#4ade80",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: isDark ? "#dc2626" : "#ef4444",
              color: "#fff",
            },
          },
        }}
      />
    </div>
  );
}
