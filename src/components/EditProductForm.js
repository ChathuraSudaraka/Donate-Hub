import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getCategories, 
  getProductById, 
  updateProduct, 
  updateProductSpecifications
} from '../lib/productQueries';
import { validateImageFile, compressImage, uploadProductImages, saveProductImagesToDB, processAllProductImages } from '../lib/storageHelpers';
import './AddProductForm.css';

export default function EditProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [originalProduct, setOriginalProduct] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    condition: 'Good',
    is_negotiable: false,
    location: ''
  });
  // Image handling
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [urlPreviews, setUrlPreviews] = useState([]);
  const [urlErrors, setUrlErrors] = useState([]);

  // Specifications
  const [specifications, setSpecifications] = useState([
    { name: '', value: '' }
  ]);

  // Load product data and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProduct(true);
        
        // Fetch product data and categories in parallel
        const [productData, categoriesData] = await Promise.all([
          getProductById(parseInt(id)),
          getCategories()
        ]);

        // Check if user owns this product
        if (productData.seller_id !== user?.id) {
          setError('You can only edit your own products');
          return;
        }

        setOriginalProduct(productData);
        setCategories(categoriesData || []);

        // Populate form with existing data
        setFormData({
          title: productData.title || '',
          description: productData.description || '',
          category_id: productData.category_id?.toString() || '',
          price: productData.price?.toString() || '',
          original_price: productData.original_price?.toString() || '',
          condition: productData.condition || 'Good',
          is_negotiable: productData.is_negotiable || false,
          location: productData.location || ''
        });

        // Set existing images
        if (productData.images && productData.images.length > 0) {
          setExistingImages(productData.images);
        }

        // Set existing specifications
        if (productData.specifications && productData.specifications.length > 0) {
          setSpecifications(productData.specifications.map(spec => ({
            name: spec.spec_name || '',
            value: spec.spec_value || ''
          })));
        }

      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id && user) {
      fetchData();
    }
  }, [id, user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image selection
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const previews = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      
      if (validation.valid) {
        // Compress image before adding to state
        const compressedFile = await compressImage(file);
        validFiles.push(compressedFile);
        
        // Create preview
        const preview = URL.createObjectURL(compressedFile);
        previews.push(preview);
        errors.push(null);
      } else {
        errors.push(validation.error);
      }
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
    setImageErrors(prev => [...prev, ...errors]);
  };

  // Remove new image
  const removeImage = (index) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageErrors(prev => prev.filter((_, i) => i !== index));
  };
  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle URL input changes
  const handleUrlChange = (index, value) => {
    setImageUrls(prev => prev.map((url, i) => i === index ? value : url));
    
    // Clear previous error
    setUrlErrors(prev => prev.map((error, i) => i === index ? null : error));
    
    // Validate URL and create preview
    if (value.trim()) {
      validateImageUrl(value.trim(), index);
    } else {
      setUrlPreviews(prev => prev.map((preview, i) => i === index ? null : preview));
    }
  };

  // Validate image URL
  const validateImageUrl = (url, index) => {
    // Basic URL validation
    try {
      new URL(url);
      
      // Check if it looks like an image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        url.toLowerCase().includes(ext)
      );
      
      if (!hasImageExtension && !url.includes('unsplash') && !url.includes('imgur') && !url.includes('cloudinary')) {
        setUrlErrors(prev => prev.map((error, i) => 
          i === index ? 'URL should point to an image file' : error
        ));
        return;
      }
      
      // Test if image loads
      const img = new Image();
      img.onload = () => {
        setUrlPreviews(prev => prev.map((preview, i) => i === index ? url : preview));
        setUrlErrors(prev => prev.map((error, i) => i === index ? null : error));
      };
      img.onerror = () => {
        setUrlErrors(prev => prev.map((error, i) => 
          i === index ? 'Unable to load image from this URL' : error
        ));
        setUrlPreviews(prev => prev.map((preview, i) => i === index ? null : preview));
      };
      img.src = url;
      
    } catch (e) {
      setUrlErrors(prev => prev.map((error, i) => 
        i === index ? 'Please enter a valid URL' : error
      ));
    }
  };

  // Add URL input field
  const addUrlField = () => {
    setImageUrls(prev => [...prev, '']);
    setUrlPreviews(prev => [...prev, null]);
    setUrlErrors(prev => [...prev, null]);
  };

  // Remove URL field
  const removeUrlField = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setUrlPreviews(prev => prev.filter((_, i) => i !== index));
    setUrlErrors(prev => prev.filter((_, i) => i !== index));
  };

  // Handle specification changes
  const handleSpecChange = (index, field, value) => {
    setSpecifications(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  // Add new specification field
  const addSpecification = () => {
    setSpecifications(prev => [...prev, { name: '', value: '' }]);
  };

  // Remove specification field
  const removeSpecification = (index) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to edit a product');
      return;
    }    // Check if there are any images (existing, new files, or URLs)
    const validUrls = imageUrls.filter(url => url.trim());
    const totalImages = existingImages.length + imageFiles.length + validUrls.length;
    
    if (totalImages === 0) {
      setError('Please keep at least one image');
      return;
    }

    // Check for URL validation errors
    const hasUrlErrors = urlErrors.some(error => error !== null);
    if (hasUrlErrors) {
      setError('Please fix the URL errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare updated product data
      const updatedData = {
        title: formData.title,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        condition: formData.condition,
        is_negotiable: formData.is_negotiable,
        location: formData.location
      };      // Update product data
      const updatedProduct = await updateProduct(parseInt(id), updatedData);

      // Process all new images (files and URLs)
      const validUrls = imageUrls.filter(url => url.trim());
      let allNewImages = [];
      
      if (imageFiles.length > 0 || validUrls.length > 0) {
        allNewImages = await processAllProductImages(imageFiles, validUrls, updatedProduct.id);
      }

      // If we have new images or existing images were modified
      if (allNewImages.length > 0 || existingImages.length !== originalProduct.images?.length) {
        // Combine existing and new images
        const allImages = [
          ...existingImages.map((img) => ({
            url: img.image_url,
            path: img.image_url
          })),
          ...allNewImages
        ];
        
        // Update all images in database
        await saveProductImagesToDB(updatedProduct.id, allImages);
      }// Update specifications
      const validSpecs = specifications.filter(spec => spec.name && spec.value);
      await updateProductSpecifications(updatedProduct.id, validSpecs);

      setSuccess('Product updated successfully!');
      
      // Redirect to product page after short delay
      setTimeout(() => {
        navigate(`/product/${updatedProduct.id}`);
      }, 2000);

    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product data...</p>
      </div>
    );
  }

  if (error && !originalProduct) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>
          Edit Product
        </h2>
        <p className="text-muted">Update your product listing information</p>
      </div>

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
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Basic Information Card */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-info-circle me-2"></i>
                  Basic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Product Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter a descriptive product title"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="4"
                        placeholder="Describe your product in detail, including features, condition, and any other relevant information"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Condition *</label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-dollar-sign me-2"></i>
                  Pricing Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Current Price (LKR) *</label>
                      <div className="input-group">
                        <span className="input-group-text">Rs.</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Original Price (LKR)</label>
                      <div className="input-group">
                        <span className="input-group-text">Rs.</span>
                        <input
                          type="number"
                          name="original_price"
                          value={formData.original_price}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <small className="form-text text-muted">Optional: Show savings to buyers</small>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="is_negotiable"
                        checked={formData.is_negotiable}
                        onChange={handleInputChange}
                        className="form-check-input"
                        id="negotiable"
                      />
                      <label className="form-check-label" htmlFor="negotiable">
                        Price is negotiable
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Location Information
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter the location of the product"
                    required
                  />
                  <small className="form-text text-muted">
                    Include city, district or area for better visibility
                  </small>
                </div>
              </div>            </div>

            {/* Current Images */}
            {existingImages.length > 0 && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-images me-2"></i>
                    Current Images
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">These are your current product images. You can remove them or add new ones.</p>
                  
                  <div className="row">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="col-md-3 mb-3">
                        <div className="image-preview-card">
                          <img 
                            src={image.image_url} 
                            alt={`Product ${index + 1}`}
                            className="img-fluid rounded"
                            onError={(e) => {
                              e.target.src = '/image/placeholder.svg';
                            }}
                          />
                          {index === 0 && <span className="badge bg-primary position-absolute top-0 start-0 m-2">Main</span>}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-camera me-2"></i>
                  Add New Images
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">Upload additional images for your product.</p>
                
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input"
                  />
                  <label htmlFor="images" className="file-input-label">
                    <div className="upload-content">
                      <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                      <h6>Click to add more images</h6>
                      <p className="text-muted">JPEG, PNG, WebP, GIF (max 5MB each)</p>
                    </div>
                  </label>
                </div>

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="row mt-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="col-md-3 mb-3">
                        <div className="image-preview-card">
                          <img src={preview} alt={`Preview ${index + 1}`} className="img-fluid rounded" />
                          <span className="badge bg-success position-absolute top-0 start-0 m-2">New</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                          {imageErrors[index] && (
                            <div className="alert alert-danger mt-2 p-2 small">{imageErrors[index]}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL Upload Section */}
                <div className="mt-4">
                  <h6>
                    <i className="fas fa-link me-2"></i>
                    Or Add Images by URL
                  </h6>
                  <p className="text-muted small">
                    You can also add images by providing direct URLs to images hosted online.
                  </p>
                  
                  {imageUrls.map((url, index) => (
                    <div key={index} className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-link"></i>
                        </span>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className={`form-control ${urlErrors[index] ? 'is-invalid' : ''}`}
                        />
                        {imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeUrlField(index)}
                            className="btn btn-outline-danger"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                      {urlErrors[index] && (
                        <div className="invalid-feedback d-block">
                          {urlErrors[index]}
                        </div>
                      )}
                      {urlPreviews[index] && (
                        <div className="mt-2">
                          <img 
                            src={urlPreviews[index]} 
                            alt="URL Preview" 
                            className="img-thumbnail"
                            style={{ maxWidth: '150px', maxHeight: '150px' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Another URL
                  </button>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-list me-2"></i>
                  Product Specifications
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">Add detailed specifications for your product (optional)</p>
                
                {specifications.map((spec, index) => (
                  <div key={index} className="row mb-3">
                    <div className="col-md-4">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        placeholder="Specification name (e.g., Brand, Model)"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder="Specification value (e.g., Apple, iPhone 13)"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-2">
                      {specifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="btn btn-outline-danger"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSpecification}
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Specification
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Tips */}
          <div className="col-lg-4">
            {/* Actions Card */}
            <div className="card mb-4">
              <div className="card-header">
                <h6>
                  <i className="fas fa-cog me-2"></i>
                  Actions
                </h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success btn-lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating Product...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Product
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-outline-secondary"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card">
              <div className="card-header">
                <h6>
                  <i className="fas fa-lightbulb me-2"></i>
                  Tips for Better Listing
                </h6>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Keep product information up to date
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Use clear, high-quality photos
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Update pricing based on market trends
                  </li>
                  <li className="mb-0">
                    <i className="fas fa-check text-success me-2"></i>
                    Respond promptly to buyer inquiries
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
