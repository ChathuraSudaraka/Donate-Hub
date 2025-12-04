import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from "./contexts/ThemeContext";
import "./Buy.css";
import {
  getAllProducts,
  getCategories,
  addCategory,
} from "./lib/productQueries";

export default function Buy() {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  // Load products from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both products and categories
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getCategories(),
        ]);

        setProducts(productsData || []);
        setFilteredProducts(productsData || []);

        // Add "All" option to categories
        const allCategories = [
          { id: "all", name: "All" },
          ...(categoriesData || []),
        ];
        setCategories(allCategories);      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        toast.error("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Handle adding new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    );
    
    if (existingCategory) {
      toast.error("This category already exists");
      return;
    }

    try {
      setCategoriesLoading(true);
      const loadingToast = toast.loading("Adding category...");
      
      const addedCategory = await addCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || null,
      });

      // Update categories list
      setCategories((prev) => [...prev, addedCategory]);

      // Reset form and close modal
      setNewCategory({ name: "", description: "" });
      setShowAddCategory(false);

      // Show success message
      toast.dismiss(loadingToast);
      toast.success("Category added successfully!");
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error(`Failed to add category: ${err.message || "Please try again"}`);
    } finally {
      setCategoriesLoading(false);
    }
  };
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "All") {
      // Find the selected category object
      const selectedCategoryObj = categories.find(
        (cat) => cat.name === selectedCategory
      );
      if (selectedCategoryObj && selectedCategoryObj.id !== "all") {
        filtered = filtered.filter(
          (product) => product.category_name === selectedCategory
        );
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, sortBy, products, categories]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };  return (
    <div className={`buy-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? 'var(--bg-secondary)' : '#fff',
            color: isDark ? 'var(--text-primary)' : '#333',
            border: isDark ? '1px solid var(--border-color)' : '1px solid #e2e8f0'
          },
          success: {
            style: {
              background: isDark ? 'var(--green-dark)' : '#10b981',
              color: '#fff'
            },
            iconTheme: {
              primary: 'var(--green-primary)',
              secondary: 'white',
            },
          },
          error: {
            style: {
              background: isDark ? '#dc2626' : '#ef4444',
              color: '#fff'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      <div className="buy-header">
        <div className="container">
          <h1 className="buy-title">Browse Second-Hand Items</h1>
          <p className="buy-subtitle">
            Find quality pre-owned items at great prices
          </p>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-md-3">
            <div className="filters-section">
              <h3>Filters</h3>
              {/* Search */}
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>{" "}
              {/* Categories */}
              <div className="filter-group">
                <label>Category</label>
                <div className="category-filters">
                  {categories.map((category) => (
                    <button
                      key={category.id || category.name}
                      className={`category-btn ${
                        selectedCategory === category.name ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </button>
                  ))}
                  <button
                    className="category-btn add-category-btn"
                    onClick={() => setShowAddCategory(true)}
                    title="Add new category"
                  >
                    <i className="fas fa-plus"></i> Add Category
                  </button>
                </div>
              </div>
              {/* Sort */}
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>{" "}
          {/* Products Grid */}
          <div className="col-md-9">
            <div className="products-header">
              <h2>
                {selectedCategory === "All" ? "All Products" : selectedCategory}
                <span className="products-count">
                  ({filteredProducts.length} items)
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <h3>Error</h3>
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>            ) : (
              <div className="row">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                      <div
                        className="product-card"
                        onClick={() => handleProductClick(product.id)}
                      >
                      <div className="product-image-container">
                        {" "}
                        <img
                          src={
                            product.primary_image || "/image/placeholder.svg"
                          }
                          alt={product.title}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = "/image/placeholder.svg";
                          }}
                        />
                        <div className="product-badges">
                          {product.is_negotiable && (
                            <span className="badge badge-negotiable">
                              Negotiable
                            </span>
                          )}
                          <span
                            className={`badge badge-condition ${product.condition.toLowerCase()}`}
                          >
                            {product.condition}
                          </span>
                        </div>
                      </div>

                      <div className="product-info">
                        <h3 className="product-name">{product.title}</h3>
                        <div className="product-pricing">
                          <span className="current-price">
                            LKR {product.price.toLocaleString()}
                          </span>
                          {product.original_price &&
                            product.original_price > product.price && (
                              <span className="original-price">
                                LKR {product.original_price.toLocaleString()}
                              </span>
                            )}
                        </div>
                        <div className="product-meta">
                          <span className="product-location">
                            📍 {product.location}
                          </span>
                          <span className="product-category">
                            🏷️ {product.category_name}
                          </span>
                        </div>                        <div className="product-date">
                          Posted:{" "}
                          {new Date(product.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    </div>
                  ))                ) : (
                  <div className="col-12">
                    <div className="no-products">
                      <h3>No products found</h3>
                      <p>Try adjusting your filters or search terms.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddCategory(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddCategory(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="add-category-form">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name *</label>
                <input
                  type="text"
                  id="categoryName"
                  className="form-control"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoryDescription">
                  Description (Optional)
                </label>
                <textarea
                  id="categoryDescription"
                  className="form-control"
                  placeholder="Enter category description"
                  rows="3"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddCategory(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={categoriesLoading || !newCategory.name.trim()}
                >
                  {categoriesLoading ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
