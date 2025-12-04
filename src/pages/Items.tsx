import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { DonationItem, ItemCategory } from "../types/database";

export default function Items() {
  const { user } = useAuth();
  const [items, setItems] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    ItemCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("donation_items")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data as DonationItem[]);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryEmoji = (category: ItemCategory) => {
    switch (category) {
      case "book":
        return "📚";
      case "pencil":
        return "✏️";
      case "school_supplies":
        return "🎒";
      default:
        return "📦";
    }
  };

  const getCategoryLabel = (category: ItemCategory) => {
    switch (category) {
      case "book":
        return "Book";
      case "pencil":
        return "Pencil";
      case "school_supplies":
        return "School Supplies";
      default:
        return category;
    }
  };

  const getCategoryImage = (category: ItemCategory) => {
    switch (category) {
      case "book":
        return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop";
      case "pencil":
        return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop";
      case "school_supplies":
        return "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop";
    }
  };

  const getCategoryColor = (category: ItemCategory) => {
    switch (category) {
      case "book":
        return "from-blue-400 to-indigo-500";
      case "pencil":
        return "from-yellow-400 to-orange-500";
      case "school_supplies":
        return "from-emerald-400 to-teal-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getCategoryBgColor = (category: ItemCategory) => {
    switch (category) {
      case "book":
        return "bg-blue-100 text-blue-700";
      case "pencil":
        return "bg-yellow-100 text-yellow-700";
      case "school_supplies":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const categoryCount = (category: ItemCategory | "all") => {
    if (category === "all") return items.length;
    return items.filter((item) => item.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              🎁 {items.length} Items Available
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Donated Items
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
              Browse through our collection of donated school supplies. Find
              what you need and request it for free!
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-16 relative z-10">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`group p-4 rounded-2xl transition-all duration-300 ${
              selectedCategory === "all"
                ? "bg-white shadow-xl ring-2 ring-emerald-500 scale-105"
                : "bg-white shadow-lg hover:shadow-xl hover:scale-105"
            }`}
          >
            <div className="text-3xl mb-2">📦</div>
            <div className="font-semibold text-gray-800">All Items</div>
            <div className="text-sm text-gray-500">
              {categoryCount("all")} available
            </div>
          </button>

          <button
            onClick={() => setSelectedCategory("book")}
            className={`group p-4 rounded-2xl transition-all duration-300 ${
              selectedCategory === "book"
                ? "bg-white shadow-xl ring-2 ring-blue-500 scale-105"
                : "bg-white shadow-lg hover:shadow-xl hover:scale-105"
            }`}
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="font-semibold text-gray-800">Books</div>
            <div className="text-sm text-gray-500">
              {categoryCount("book")} available
            </div>
          </button>

          <button
            onClick={() => setSelectedCategory("pencil")}
            className={`group p-4 rounded-2xl transition-all duration-300 ${
              selectedCategory === "pencil"
                ? "bg-white shadow-xl ring-2 ring-yellow-500 scale-105"
                : "bg-white shadow-lg hover:shadow-xl hover:scale-105"
            }`}
          >
            <div className="text-3xl mb-2">✏️</div>
            <div className="font-semibold text-gray-800">Pencils</div>
            <div className="text-sm text-gray-500">
              {categoryCount("pencil")} available
            </div>
          </button>

          <button
            onClick={() => setSelectedCategory("school_supplies")}
            className={`group p-4 rounded-2xl transition-all duration-300 ${
              selectedCategory === "school_supplies"
                ? "bg-white shadow-xl ring-2 ring-emerald-500 scale-105"
                : "bg-white shadow-lg hover:shadow-xl hover:scale-105"
            }`}
          >
            <div className="text-3xl mb-2">🎒</div>
            <div className="font-semibold text-gray-800">Supplies</div>
            <div className="text-sm text-gray-500">
              {categoryCount("school_supplies")} available
            </div>
          </button>
        </div>

        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === "all"
                ? "All Items"
                : getCategoryLabel(selectedCategory as ItemCategory)}
            </h2>
            <p className="text-gray-600">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"} found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-emerald-100 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-emerald-100 text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-gray-600">Loading items...</p>
          </div>
        )}

        {/* Grid View */}
        {!loading && filteredItems.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url || getCategoryImage(item.category)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${getCategoryColor(
                      item.category
                    )} opacity-20`}
                  ></div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryBgColor(
                        item.category
                      )} backdrop-blur-sm`}
                    >
                      {getCategoryEmoji(item.category)}{" "}
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  {/* Quantity Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                      {item.quantity} left
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/items/${item.id}`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </Link>
                    {user ? (
                      <Link
                        to="/request"
                        className="flex-1 text-center bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Request
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="flex-1 text-center bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && filteredItems.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row"
              >
                {/* Item Image */}
                <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image_url || getCategoryImage(item.category)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(
                      item.category
                    )} opacity-20`}
                  ></div>
                </div>

                {/* Item Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryBgColor(
                          item.category
                        )}`}
                      >
                        {getCategoryEmoji(item.category)}{" "}
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} available
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/items/${item.id}`}
                      className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </Link>
                    {user ? (
                      <Link
                        to="/request"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Request
                        <span>→</span>
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Login
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <span className="text-5xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery
                ? `We couldn't find any items matching "${searchQuery}". Try a different search term.`
                : selectedCategory === "all"
                ? "There are no items available at the moment. Check back later!"
                : `No ${getCategoryLabel(
                    selectedCategory as ItemCategory
                  ).toLowerCase()} items available. Try a different category.`}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* CTA Banner */}
        {!loading && (
          <div className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Need something specific?
                </h3>
                <p className="text-emerald-100">
                  Can't find what you're looking for? Submit a request and we'll
                  try to help!
                </p>
              </div>
              {user ? (
                <Link
                  to="/request"
                  className="flex-shrink-0 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 hover:text-emerald-700 transition-colors shadow-lg"
                >
                  Submit a Request
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="flex-shrink-0 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 hover:text-emerald-700 transition-colors shadow-lg"
                >
                  Sign Up to Request
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
