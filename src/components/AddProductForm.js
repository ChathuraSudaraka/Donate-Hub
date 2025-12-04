import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  getCategories,
  addProductWithImages,
  addProductSpecifications,
  getUserCredits,
  deductCreditsForProduct,
} from "../lib/productQueries";
import {
  validateImageFile,
  compressImage,
  processAllProductImages,
} from "../lib/storageHelpers";
import "./AddProductForm.css";

export default function AddProductForm({ onSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Credit system state
  const [userCredits, setUserCredits] = useState(0);
  const [creditLoading, setCreditLoading] = useState(false);
  const CREDITS_PER_PRODUCT = 5; // Cost to post one product

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    original_price: "",
    condition: "Good",
    is_negotiable: false,
    location: "",
  });
  // Image handling
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [imageUrls, setImageUrls] = useState([""]);
  const [urlPreviews, setUrlPreviews] = useState([]);
  const [urlErrors, setUrlErrors] = useState([]);

  // Specifications
  const [specifications, setSpecifications] = useState([
    { name: "", value: "" },
  ]);
  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Check if user profile is complete
  const checkProfileCompleteness = () => {
    if (!user) return false;

    const requiredFields = [
      user?.user_metadata?.full_name,
      user?.user_metadata?.phone_number,
      user?.user_metadata?.location,
    ];

    return requiredFields.every((field) => field && field.trim() !== "");
  };
  // Check profile completeness on mount
  useEffect(() => {
    if (user) {
      const isComplete = checkProfileCompleteness();
      setProfileIncomplete(!isComplete);
      if (!isComplete) {
        setError(
          "⚠️ Complete Your Profile First! Please add your full name, phone number, and location in Dashboard Settings before listing products."
        );
      }
    }
  }, [user]);

  // Load user credits
  useEffect(() => {
    const loadCredits = async () => {
      if (user) {
        try {
          setCreditLoading(true);
          const credits = await getUserCredits(user.id);
          setUserCredits(credits);
        } catch (err) {
          console.error("Error loading credits:", err);
        } finally {
          setCreditLoading(false);
        }
      }
    };
    loadCredits();
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image file selection
  const handleImageSelect = async (e) => {
    console.log("handleImageSelect called");
    const files = Array.from(e.target.files);
    console.log("Selected files:", files);

    if (files.length === 0) return;

    setImageErrors([]);
    const newPreviews = [];
    const newFiles = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i}:`, file.name, file.type, file.size);

      // Validate file
      const validation = validateImageFile(file);
      console.log(`Validation result for ${file.name}:`, validation);
      if (!validation.valid) {
        errors[i] = validation.error;
        console.log(`Validation failed for ${file.name}:`, validation.error);
        continue;
      }

      try {
        // Create preview
        const preview = URL.createObjectURL(file);
        newPreviews[i] = preview;
        newFiles[i] = file;
        console.log(`Preview created for ${file.name}:`, preview);
      } catch (error) {
        errors[i] = "Failed to process image";
        console.error("Error processing image:", error);
      }
    }

    console.log("New previews:", newPreviews.filter(Boolean));
    console.log("New files:", newFiles.filter(Boolean));
    console.log("Errors:", errors);

    setImagePreviews((prev) => [...prev, ...newPreviews.filter(Boolean)]);
    setImageFiles((prev) => [...prev, ...newFiles.filter(Boolean)]);
    setImageErrors((prev) => [...prev, ...errors]);
  };

  // Remove image
  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImageErrors((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle URL input changes
  const handleUrlChange = (index, value) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));

    // Clear previous error
    setUrlErrors((prev) =>
      prev.map((error, i) => (i === index ? null : error))
    );

    // Validate URL and create preview
    if (value.trim()) {
      validateImageUrl(value.trim(), index);
    } else {
      setUrlPreviews((prev) =>
        prev.map((preview, i) => (i === index ? null : preview))
      );
    }
  };

  // Validate image URL
  const validateImageUrl = (url, index) => {
    // Basic URL validation
    try {
      new URL(url);

      // Check if it looks like an image URL
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".svg",
      ];
      const hasImageExtension = imageExtensions.some((ext) =>
        url.toLowerCase().includes(ext)
      );

      if (
        !hasImageExtension &&
        !url.includes("unsplash") &&
        !url.includes("imgur") &&
        !url.includes("cloudinary")
      ) {
        setUrlErrors((prev) =>
          prev.map((error, i) =>
            i === index ? "URL should point to an image file" : error
          )
        );
        return;
      }

      // Test if image loads
      const img = new Image();
      img.onload = () => {
        setUrlPreviews((prev) =>
          prev.map((preview, i) => (i === index ? url : preview))
        );
        setUrlErrors((prev) =>
          prev.map((error, i) => (i === index ? null : error))
        );
      };
      img.onerror = () => {
        setUrlErrors((prev) =>
          prev.map((error, i) =>
            i === index ? "Unable to load image from this URL" : error
          )
        );
        setUrlPreviews((prev) =>
          prev.map((preview, i) => (i === index ? null : preview))
        );
      };
      img.src = url;
    } catch (e) {
      setUrlErrors((prev) =>
        prev.map((error, i) =>
          i === index ? "Please enter a valid URL" : error
        )
      );
    }
  };

  // Add URL input field
  const addUrlField = () => {
    setImageUrls((prev) => [...prev, ""]);
    setUrlPreviews((prev) => [...prev, null]);
    setUrlErrors((prev) => [...prev, null]);
  };

  // Remove URL field
  const removeUrlField = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setUrlPreviews((prev) => prev.filter((_, i) => i !== index));
    setUrlErrors((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle specification changes
  const handleSpecChange = (index, field, value) => {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
  };

  // Add new specification field
  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { name: "", value: "" }]);
  };
  // Remove specification field
  const removeSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };
  // AI-powered product details enhancement using Google Gemini AI
  const generateAIProductDetails = async () => {
    if (!formData.title.trim()) {
      setError("Please enter a product title first to use AI enhancement");
      return;
    }

    setAiLoading(true);
    setError("");

    try {
      const selectedCategory = categories.find(
        (cat) => cat.id === parseInt(formData.category_id)
      );
      const categoryName = selectedCategory ? selectedCategory.name : "General";

      // Call Google Gemini AI API
      const aiResponse = await callGoogleAI(
        formData.title,
        categoryName,
        formData.condition,
        formData.description
      );
      if (aiResponse && aiResponse.enhanced_description) {
        setAiSuggestions(aiResponse);
        setShowAiPanel(true);
        setSuccess(
          "🤖 AI analysis complete! Review the intelligent suggestions below."
        );
      } else {
        throw new Error("AI service returned invalid response");
      }
    } catch (err) {
      console.error("Error generating AI suggestions:", err);

      // Fallback to local suggestions if AI fails
      console.log("Falling back to local AI suggestions...");
      const selectedCategory = categories.find(
        (cat) => cat.id === parseInt(formData.category_id)
      );
      const categoryName = selectedCategory ? selectedCategory.name : "General";
      const fallbackResponse = generateSmartSuggestions(
        formData.title,
        categoryName,
        formData.condition
      );
      setAiSuggestions(fallbackResponse);
      setShowAiPanel(true);
      setSuccess("💡 Smart suggestions generated! (Offline mode)");
    } finally {
      setAiLoading(false);
    }
  };
  // Call Google Gemini AI API
  const callGoogleAI = async (
    title,
    category,
    condition,
    existingDescription = ""
  ) => {
    // Try different environment variable patterns
    const API_KEY =
      import.meta.env.VITE_GOOGLE_AI_API_KEY ||
      process.env.REACT_APP_GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY;

    if (!API_KEY || API_KEY === "your-google-ai-api-key") {
      throw new Error(
        "Google AI API key not configured. Please add VITE_GOOGLE_AI_API_KEY to your .env file"
      );
    }

    const prompt = `
You are an expert marketplace product listing optimizer for Sri Lankan online marketplace. 
Analyze this product and generate comprehensive suggestions:

Product Title: "${title}"
Category: "${category}"
Condition: "${condition}"
Existing Description: "${existingDescription}"

Please provide a JSON response with the following structure:
{
  "enhanced_description": "A compelling, detailed product description (200-300 words) that highlights key features, benefits, and appeals to Sri Lankan buyers. Include condition details, usage scenarios, and call-to-action.",
  "specifications": [
    {"name": "spec_name", "value": "spec_value"}
  ],
  "suggested_price_range": {
    "min": number,
    "max": number,
    "currency": "LKR"
  },
  "keywords": ["keyword1", "keyword2", "..."],
  "selling_points": ["point1", "point2", "..."],
  "title_suggestions": ["title1", "title2", "title3"],
  "market_insights": {
    "demand_level": "High/Medium/Low",
    "best_selling_time": "timing_advice",
    "price_trends": "pricing_advice",
    "competition_tips": "competitive_advantage_tips"
  },
  "seo_optimization": {
    "recommended_title": "SEO optimized title",
    "meta_description": "Short description for search engines",
    "local_keywords": ["sri_lanka_specific_keywords"]
  }
}

Consider Sri Lankan market conditions, local preferences, currency (LKR), popular brands, and cultural factors. Make suggestions practical and locally relevant.
`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Google AI API Error Response:", errorText);
        throw new Error(
          `Google AI API error: ${response.status} ${response.statusText}. Check your API key and quota.`
        );
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid response from Google AI API");
      }

      const aiText = data.candidates[0].content.parts[0].text;

      // Extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const aiSuggestions = JSON.parse(jsonMatch[0]);

      // Validate and format the response
      return {
        enhanced_description:
          aiSuggestions.enhanced_description ||
          `Enhanced description for ${title}`,
        specifications: aiSuggestions.specifications || [
          { name: "Brand", value: "" },
          { name: "Model", value: "" },
          { name: "Condition", value: condition },
        ],
        suggested_price_range: aiSuggestions.suggested_price_range || {
          min: 10000,
          max: 50000,
        },
        keywords: aiSuggestions.keywords || [
          title.toLowerCase(),
          category.toLowerCase(),
        ],
        selling_points: aiSuggestions.selling_points || [
          `${condition} condition`,
          "Quick sale",
          "Negotiable price",
        ],
        title_suggestions: aiSuggestions.title_suggestions || [
          `${title} - ${condition}`,
          `🔥 ${title} - Quick Sale!`,
        ],
        market_insights: aiSuggestions.market_insights || {
          demand_level: "Medium",
          best_selling_time: "Weekends typically see more activity",
          price_trends: "Competitive pricing recommended",
          competition_tips: "High-quality photos increase success rate",
        },
        seo_optimization: aiSuggestions.seo_optimization || {
          recommended_title: title,
          meta_description: `${title} in ${condition} condition for sale in Sri Lanka`,
          local_keywords: ["sri lanka", "colombo", "sale"],
        },
      };
    } catch (error) {
      console.error("Google AI API call failed:", error);
      throw error;
    }
  };

  // Modern smart suggestions fallback (matches Google AI format)
  const generateSmartSuggestions = (title, category, condition) => {
    const lowerTitle = title.toLowerCase();

    // Detect product type
    const productType = detectProductType(lowerTitle);

    // Generate enhanced description
    const description = generateEnhancedDescription(
      title,
      productType,
      condition
    );

    // Generate specifications
    const specifications = generateSpecifications(productType, condition);

    // Calculate price range
    const priceRange = calculatePriceRange(productType, condition);

    // Generate keywords
    const keywords = generateKeywords(title, category, productType);

    return {
      enhanced_description: description,
      specifications: specifications,
      suggested_price_range: priceRange,
      keywords: keywords,
      selling_points: generateSellingPoints(productType, condition),
      title_suggestions: generateTitleSuggestions(title, condition),
      market_insights: {
        demand_level: "Medium",
        best_selling_time: "Weekends and evenings typically see more activity",
        price_trends:
          "Competitive pricing with room for negotiation works best",
        competition_tips:
          "Clear photos and detailed descriptions increase success by 60%",
      },
      seo_optimization: {
        recommended_title: `${title} - ${condition} Condition - Sri Lanka`,
        meta_description: `${title} in ${condition} condition for sale in Sri Lanka. Genuine seller, negotiable price.`,
        local_keywords: [
          "sri lanka",
          "colombo",
          "genuine seller",
          "negotiable",
        ],
      },
    };
  };

  const detectProductType = (lowerTitle) => {
    if (
      lowerTitle.includes("phone") ||
      lowerTitle.includes("mobile") ||
      lowerTitle.includes("iphone")
    )
      return "smartphone";
    if (
      lowerTitle.includes("laptop") ||
      lowerTitle.includes("computer") ||
      lowerTitle.includes("macbook")
    )
      return "laptop";
    if (lowerTitle.includes("car") || lowerTitle.includes("vehicle"))
      return "car";
    if (
      lowerTitle.includes("bike") ||
      lowerTitle.includes("motorcycle") ||
      lowerTitle.includes("scooter")
    )
      return "motorcycle";
    if (
      lowerTitle.includes("chair") ||
      lowerTitle.includes("table") ||
      lowerTitle.includes("sofa") ||
      lowerTitle.includes("furniture")
    )
      return "furniture";
    return "general";
  };

  const generateEnhancedDescription = (title, productType, condition) => {
    const templates = {
      smartphone: `This ${title} is in ${condition.toLowerCase()} condition and ready for immediate use. All functions including camera, battery, and connectivity have been tested and work perfectly. The device shows ${
        condition === "Excellent"
          ? "minimal"
          : condition === "Good"
          ? "light"
          : "some"
      } signs of use but maintains excellent performance. Perfect for daily communication, social media, work, and entertainment. Includes original charger and basic accessories.`,

      laptop: `High-performance ${title} in ${condition.toLowerCase()} condition, perfect for work, study, or entertainment. All ports, keyboard, trackpad, and display function smoothly. Battery holds good charge and performance remains reliable for all computing needs. Ideal for professionals, students, or anyone needing dependable computing power. Comes with original charger.`,

      car: `Well-maintained ${title} in ${condition.toLowerCase()} condition with clean service history. All documents are up-to-date and ready for immediate transfer. Engine runs smoothly with no mechanical issues, and both interior and exterior are well-preserved. Perfect for daily commuting or family use. Serious buyers welcome for inspection.`,

      motorcycle: `Reliable ${title} in ${condition.toLowerCase()} condition with excellent running performance. Regular maintenance has been maintained and all papers are clear and updated. Engine performance is smooth with good fuel efficiency, making it perfect for daily commuting. Low running costs and environmentally friendly transportation option.`,

      furniture: `Quality ${title} in ${condition.toLowerCase()} condition with sturdy construction and durable materials. Shows ${
        condition === "Excellent" ? "minimal" : "appropriate"
      } wear for its age but remains fully functional and attractive. Perfect addition to any home or office space, combining both functionality and style.`,

      general: `Quality ${title} available in ${condition.toLowerCase()} condition. Well-maintained with careful usage and all features remain fully functional. Excellent value for money with reliable performance. Perfect for anyone looking for a dependable item at a great price.`,
    };

    let description = templates[productType] || templates.general;
    description += ` Located in Sri Lanka with flexible pickup/delivery options. Serious buyers only - price is negotiable for genuine purchasers. Contact for viewing and more details. Cash payment preferred for quick transactions.`;

    return description;
  };

  const generateSpecifications = (productType, condition) => {
    const specs = {
      smartphone: [
        { name: "Type", value: "Smartphone" },
        { name: "Condition", value: condition },
        {
          name: "Battery Health",
          value:
            condition === "Excellent"
              ? "90-95%"
              : condition === "Good"
              ? "80-90%"
              : "70-85%",
        },
        { name: "Accessories", value: "Charger included" },
        { name: "Warranty", value: "No warranty" },
      ],
      laptop: [
        { name: "Type", value: "Laptop Computer" },
        { name: "Condition", value: condition },
        {
          name: "Battery Life",
          value: condition === "Excellent" ? "6-8 hours" : "4-6 hours",
        },
        { name: "Accessories", value: "Charger included" },
        { name: "Operating System", value: "Windows/macOS" },
      ],
      car: [
        { name: "Type", value: "Motor Vehicle" },
        { name: "Condition", value: condition },
        { name: "Documentation", value: "All papers clear" },
        { name: "Service History", value: "Available" },
        { name: "Registration", value: "Up to date" },
      ],
      motorcycle: [
        { name: "Type", value: "Motorcycle" },
        { name: "Condition", value: condition },
        { name: "Papers", value: "All clear and updated" },
        { name: "Maintenance", value: "Regular service maintained" },
        { name: "Fuel Efficiency", value: "Excellent" },
      ],
      furniture: [
        { name: "Type", value: "Furniture" },
        { name: "Condition", value: condition },
        { name: "Material", value: "Quality construction" },
        { name: "Assembly", value: "Ready to use" },
        { name: "Durability", value: "Long-lasting" },
      ],
    };

    return (
      specs[productType] || [
        { name: "Condition", value: condition },
        { name: "Quality", value: "Good" },
        { name: "Functionality", value: "Fully working" },
      ]
    );
  };

  const calculatePriceRange = (productType, condition) => {
    const basePrices = {
      smartphone: { min: 15000, max: 150000 },
      laptop: { min: 50000, max: 300000 },
      car: { min: 800000, max: 5000000 },
      motorcycle: { min: 80000, max: 400000 },
      furniture: { min: 5000, max: 100000 },
      general: { min: 1000, max: 50000 },
    };

    const conditionMultipliers = {
      Excellent: 0.85,
      Good: 0.7,
      Fair: 0.55,
      Poor: 0.35,
    };

    const basePrice = basePrices[productType] || basePrices.general;
    const multiplier = conditionMultipliers[condition] || 0.7;

    return {
      min: Math.round(basePrice.min * multiplier),
      max: Math.round(basePrice.max * multiplier),
      currency: "LKR",
    };
  };

  const generateKeywords = (title, category, productType) => {
    const keywords = new Set();

    // Add title words
    title
      .toLowerCase()
      .split(" ")
      .forEach((word) => {
        if (word.length > 2) keywords.add(word);
      });

    // Add category
    keywords.add(category.toLowerCase());

    // Add location keywords
    ["sri lanka", "colombo", "sale", "urgent", "negotiable"].forEach((kw) =>
      keywords.add(kw)
    );

    // Add product-specific keywords
    const typeKeywords = {
      smartphone: ["mobile", "phone", "android", "ios"],
      laptop: ["computer", "work", "study", "portable"],
      car: ["vehicle", "transport", "family", "registered"],
      motorcycle: ["bike", "commute", "fuel efficient"],
      furniture: ["home", "office", "decor"],
    };

    (typeKeywords[productType] || []).forEach((kw) => keywords.add(kw));

    return Array.from(keywords).slice(0, 12);
  };

  const generateSellingPoints = (productType, condition) => {
    const points = [
      `${condition} condition`,
      "Genuine seller",
      "Negotiable price",
      "Quick sale preferred",
    ];

    const typePoints = {
      smartphone: ["All functions tested", "Charger included"],
      laptop: ["Perfect for work/study", "Good battery life"],
      car: ["Service history available", "All documents clear"],
      motorcycle: ["Fuel efficient", "Low maintenance"],
      furniture: ["Quality construction", "Ready to use"],
    };

    points.push(
      ...(typePoints[productType] || ["Quality assured", "Value for money"])
    );

    return points.slice(0, 6);
  };

  const generateTitleSuggestions = (title, condition) => {
    return [
      `${title} - ${condition} Condition`,
      `🔥 ${title} - Quick Sale!`,
      `💰 ${title} - Negotiable Price`,
      `📍 ${title} - Colombo/Islandwide Delivery`,
    ].slice(0, 3);
  };

  // Apply AI suggestions to form
  const applyAISuggestions = (suggestions) => {
    if (suggestions.enhanced_description) {
      setFormData((prev) => ({
        ...prev,
        description: suggestions.enhanced_description,
      }));
    }

    if (suggestions.specifications && suggestions.specifications.length > 0) {
      setSpecifications(suggestions.specifications);
    }

    if (suggestions.suggested_price_range && !formData.price) {
      const suggestedPrice = Math.round(
        (suggestions.suggested_price_range.min +
          suggestions.suggested_price_range.max) /
          2
      );
      setFormData((prev) => ({
        ...prev,
        price: suggestedPrice.toString(),
        original_price: suggestions.suggested_price_range.max.toString(),
      }));
    }

    setShowAiPanel(false);
    setSuccess(
      "✨ AI suggestions applied successfully! Review and adjust as needed."
    );
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to add a product");
      return;
    } // Check profile completeness
    if (!checkProfileCompleteness()) {
      setError(
        "🚨 Profile Incomplete! Please complete your profile information (full name, phone number, and location) in Dashboard Settings before adding products."
      );
      return;
    } // Check if user has enough credits
    if (userCredits < CREDITS_PER_PRODUCT) {
      setError(
        <div>
          <strong>❌ Insufficient Credits!</strong>
          <br />
          You need {CREDITS_PER_PRODUCT} credits to post a product. You
          currently have {userCredits} credits.
          <br />
          <button
            className="btn btn-sm btn-outline-primary mt-2"
            onClick={() => navigate("/dashboard?section=credits")}
            type="button"
          >
            <i className="fas fa-coins me-1"></i>Purchase Credits
          </button>
        </div>
      );
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setError("Please enter a product title");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a product description");
      return;
    }

    if (!formData.category_id) {
      setError("Please select a category");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter a location");
      return;
    }

    if (
      imageFiles.length === 0 &&
      imageUrls.filter((url) => url.trim()).length === 0
    ) {
      setError("Please add at least one image (file upload or URL)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Starting product submission...");
      console.log("Form data:", formData);
      console.log("User ID:", user.id);
      console.log("Image files:", imageFiles.length);
      console.log(
        "Image URLs:",
        imageUrls.filter((url) => url.trim())
      );

      // Prepare product data
      const productData = {
        seller_id: user.id,
        category_id: parseInt(formData.category_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        condition: formData.condition,
        is_negotiable: formData.is_negotiable || false,
        location: formData.location.trim(),
      };

      console.log("Product data prepared:", productData);

      // Process images
      const validUrls = imageUrls.filter((url) => url && url.trim());
      console.log(
        "Processing images - Files:",
        imageFiles.length,
        "URLs:",
        validUrls.length
      );

      const allImages = await processAllProductImages(
        imageFiles,
        validUrls,
        Date.now()
      );
      console.log("Images processed:", allImages.length); // Add product with images
      const product = await addProductWithImages(productData, allImages);
      console.log("Product added successfully:", product);

      // Deduct credits for posting the product
      try {
        await deductCreditsForProduct(user.id, product.id, CREDITS_PER_PRODUCT);
        console.log(
          `${CREDITS_PER_PRODUCT} credits deducted for product posting`
        );
        // Update local credits state
        setUserCredits((prev) => prev - CREDITS_PER_PRODUCT);
      } catch (creditError) {
        console.error("Error deducting credits:", creditError);
        // Note: We don't fail the entire operation if credit deduction fails
        // But we should log it for manual review
      }

      // Add specifications if any
      const validSpecs = specifications.filter(
        (spec) => spec.name && spec.value
      );
      if (validSpecs.length > 0) {
        console.log("Adding specifications:", validSpecs);
        await addProductSpecifications(product.id, validSpecs);
        console.log("Specifications added successfully");
      }
      setSuccess("Product added successfully!");

      // Call onSuccess callback if provided (from Dashboard)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Redirect to product page after short delay
        setTimeout(() => {
          navigate(`/product/${product.id}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Detailed error adding product:", err);
      console.error("Error message:", err.message);
      console.error("Error details:", err.details);
      console.error("Error hint:", err.hint);

      // More specific error messages
      if (err.message.includes("violates foreign key constraint")) {
        setError(
          "Invalid category selected. Please refresh the page and try again."
        );
      } else if (err.message.includes("duplicate key")) {
        setError(
          "A product with this title already exists. Please use a different title."
        );
      } else if (err.message.includes("permission")) {
        setError(
          "You do not have permission to add products. Please check your account settings."
        );
      } else if (
        err.message.includes("network") ||
        err.message.includes("fetch")
      ) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError(
          `Failed to add product: ${err.message || "Please try again."}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // AI Suggestion Handler
  const handleAiSuggest = async () => {
    setAiLoading(true);
    setError("");
    setSuccess("");

    try {
      // Call your AI service here
      const response = await fetch("/api/ai-suggest-product-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`, // Adjust based on your auth setup
        },
        body: JSON.stringify({
          images: imageUrls.filter((url) => url.trim()),
          // Add other relevant data for AI suggestion
        }),
      });

      if (!response.ok) {
        throw new Error("AI service responded with an error");
      }

      const data = await response.json();

      // Handle AI response data
      if (data.success) {
        setAiSuggestions(data.suggestions);
        setSuccess("AI suggestions loaded successfully!");
      } else {
        setError(data.message || "Failed to fetch AI suggestions");
      }
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setError("Failed to fetch AI suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI Suggestions
  const handleApplyAiSuggestions = () => {
    if (aiSuggestions) {
      setFormData((prev) => ({
        ...prev,
        title: aiSuggestions.title || prev.title,
        description: aiSuggestions.description || prev.description,
        // Map other fields as necessary
      }));

      setSuccess("AI suggestions applied to the form");
    } else {
      setError("No AI suggestions available to apply");
    }
  };

  return (
    <div className="dashboard-content">
      {" "}
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>Add New Product</h2>
            <p className="text-muted">
              Create a new product listing for the marketplace
            </p>
          </div>{" "}
          <div className="credits-display">
            <div
              className={`credits-card-small ${
                userCredits < CREDITS_PER_PRODUCT ? "insufficient-credits" : ""
              }`}
            >
              <div className="credits-icon">
                <i className="fas fa-coins"></i>
              </div>
              <div className="credits-info">
                <div className="credits-amount">{userCredits}</div>
                <div className="credits-label">Credits</div>
              </div>
            </div>
            <small className="text-muted d-block mt-1">
              {CREDITS_PER_PRODUCT} credits required per product
            </small>
            {userCredits < CREDITS_PER_PRODUCT && (
              <small className="text-danger d-block">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Insufficient credits
              </small>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}{" "}
      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}
      {profileIncomplete && (
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <i className="fas fa-user-edit me-2"></i>
              Profile Incomplete
            </h5>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              {" "}
              <div className="col-md-8">
                <h6 className="text-warning mb-2">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  🚨 Complete Your Profile First
                </h6>
                <p className="mb-2 fw-bold">
                  Before adding products, please complete your profile
                  information including:
                </p>
                <ul className="mb-3 text-warning">
                  <li>
                    <strong>✓ Full Name</strong>
                  </li>
                  <li>
                    <strong>✓ Phone Number</strong>
                  </li>
                  <li>
                    <strong>✓ Location</strong>
                  </li>
                </ul>
                <p className="text-muted small mb-0">
                  This information helps buyers contact you and builds trust in
                  the marketplace.
                </p>
              </div>
              <div className="col-md-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard?section=settings")}
                  className="btn btn-warning"
                >
                  <i className="fas fa-cog me-2"></i>
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          opacity: profileIncomplete ? 0.6 : 1,
          pointerEvents: profileIncomplete ? "none" : "auto",
        }}
      >
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
                        {categories.map((category) => (
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
                        <option value="Excellent">Excellent - Like new</option>
                        <option value="Good">Good - Minor wear</option>
                        <option value="Fair">Fair - Noticeable wear</option>
                        <option value="Poor">Poor - Significant wear</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your city or area"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* AI Enhancement Card */}
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-magic me-2"></i>
                  AI Product Enhancement
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  <i className="fas fa-robot me-1"></i>
                  Let AI help you create detailed product descriptions,
                  specifications, and pricing suggestions.
                </p>

                <div className="d-grid">
                  <button
                    type="button"
                    onClick={generateAIProductDetails}
                    disabled={aiLoading || !formData.title.trim()}
                    className="btn btn-primary btn-lg"
                  >
                    {aiLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        AI is analyzing your product...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sparkles me-2"></i>
                        Enhance with AI
                      </>
                    )}
                  </button>
                </div>

                {!formData.title.trim() && (
                  <small className="text-muted mt-2 d-block">
                    <i className="fas fa-info-circle me-1"></i>
                    Please enter a product title first to use AI enhancement
                  </small>
                )}
              </div>
            </div>{" "}
            {/* AI Suggestions Panel */}
            {showAiPanel && aiSuggestions && (
              <div className="card mb-4 border-success">
                <div
                  className="card-header bg-gradient"
                  style={{
                    background: "linear-gradient(135deg, #28a745, #20c997)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-white">
                      <i className="fas fa-robot me-2"></i>
                      🤖 AI-Powered Suggestions
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAiPanel(false)}
                      className="btn btn-sm btn-outline-light"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {/* Market Insights Section */}
                  {aiSuggestions.market_insights && (
                    <div className="alert alert-info mb-4">
                      <h6>
                        <i className="fas fa-chart-line me-2"></i>Market
                        Insights
                      </h6>
                      <div className="row">
                        <div className="col-md-4">
                          <small>
                            <strong>Demand:</strong>{" "}
                            {aiSuggestions.market_insights.demand_level}
                          </small>
                        </div>
                        <div className="col-md-8">
                          <small>
                            <strong>Tip:</strong>{" "}
                            {aiSuggestions.market_insights.competition_tips}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row">
                    {/* Enhanced Description */}
                    <div className="col-12 mb-4">
                      <h6>
                        <i className="fas fa-file-alt me-2 text-primary"></i>
                        AI-Enhanced Description:
                      </h6>
                      <div className="bg-light p-3 rounded border">
                        <p className="mb-0 small" style={{ lineHeight: "1.6" }}>
                          {aiSuggestions.enhanced_description}
                        </p>
                      </div>
                    </div>

                    {/* Title Suggestions */}
                    {aiSuggestions.title_suggestions && (
                      <div className="col-12 mb-3">
                        <h6>
                          <i className="fas fa-heading me-2 text-primary"></i>
                          Optimized Title Suggestions:
                        </h6>
                        <div className="bg-light p-3 rounded border">
                          {aiSuggestions.title_suggestions.map(
                            (title, index) => (
                              <div key={index} className="small mb-2">
                                <span className="badge bg-secondary me-2">
                                  {index + 1}
                                </span>
                                {title}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specifications */}
                    <div className="col-md-6 mb-3">
                      <h6>
                        <i className="fas fa-list me-2 text-primary"></i>Smart
                        Specifications:
                      </h6>
                      <div className="bg-light p-3 rounded border">
                        {aiSuggestions.specifications.map((spec, index) => (
                          <div
                            key={index}
                            className="small mb-1 d-flex justify-content-between"
                          >
                            <strong>{spec.name}:</strong>
                            <span className="text-muted">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Analysis */}
                    <div className="col-md-6 mb-3">
                      <h6>
                        <i className="fas fa-dollar-sign me-2 text-primary"></i>
                        AI Price Analysis:
                      </h6>
                      <div className="bg-light p-3 rounded border">
                        <div className="small mb-2">
                          <strong>Suggested Range:</strong>
                          <br />
                          Rs.{" "}
                          {aiSuggestions.suggested_price_range.min.toLocaleString()}{" "}
                          - Rs.{" "}
                          {aiSuggestions.suggested_price_range.max.toLocaleString()}
                        </div>
                        <div className="small text-success">
                          <strong>Sweet Spot:</strong> Rs.{" "}
                          {Math.round(
                            (aiSuggestions.suggested_price_range.min +
                              aiSuggestions.suggested_price_range.max) /
                              2
                          ).toLocaleString()}
                        </div>
                        {aiSuggestions.market_insights?.price_trends && (
                          <div className="small text-muted mt-2">
                            💡 {aiSuggestions.market_insights.price_trends}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SEO Optimization */}
                    {aiSuggestions.seo_optimization && (
                      <div className="col-md-6 mb-3">
                        <h6>
                          <i className="fas fa-search me-2 text-primary"></i>SEO
                          Keywords:
                        </h6>
                        <div className="bg-light p-3 rounded border">
                          <div className="d-flex flex-wrap gap-1">
                            {(
                              aiSuggestions.keywords ||
                              aiSuggestions.seo_optimization.local_keywords ||
                              []
                            ).map((keyword, index) => (
                              <span
                                key={index}
                                className="badge bg-primary small"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selling Points */}
                    <div className="col-md-6 mb-3">
                      <h6>
                        <i className="fas fa-star me-2 text-primary"></i>Key
                        Selling Points:
                      </h6>
                      <div className="bg-light p-3 rounded border">
                        {aiSuggestions.selling_points.map((point, index) => (
                          <div key={index} className="small mb-1">
                            <i className="fas fa-check-circle text-success me-1"></i>
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Best Selling Time */}
                  {aiSuggestions.market_insights?.best_selling_time && (
                    <div className="alert alert-warning small mb-4">
                      <i className="fas fa-clock me-2"></i>
                      <strong>Timing Tip:</strong>{" "}
                      {aiSuggestions.market_insights.best_selling_time}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      onClick={() => applyAISuggestions(aiSuggestions)}
                      className="btn btn-success"
                    >
                      <i className="fas fa-magic me-2"></i>
                      Apply AI Suggestions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          aiSuggestions.enhanced_description
                        );
                        setSuccess("Description copied to clipboard!");
                      }}
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-copy me-2"></i>
                      Copy Description
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiPanel(false)}
                      className="btn btn-outline-secondary"
                    >
                      <i className="fas fa-times me-2"></i>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Product Images Card */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-images me-2"></i>
                  Product Images *
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  <i className="fas fa-info-circle me-1"></i>
                  Upload high-quality images. The first image will be your main
                  product photo.
                </p>{" "}
                {/* File Upload */}
                <div className="image-upload-area mb-4">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input"
                  />
                  <label htmlFor="images" className="file-input-label">
                    <i className="fas fa-cloud-upload-alt upload-icon"></i>
                    <h6>Click to upload images</h6>
                    <p className="upload-subtitle">
                      or drag and drop files here
                    </p>
                    <small className="text-muted">
                      PNG, JPG, GIF up to 10MB each
                    </small>
                  </label>

                  {/* Show image errors */}
                  {imageErrors.length > 0 && (
                    <div className="mt-2">
                      {imageErrors.map(
                        (error, index) =>
                          error && (
                            <div
                              key={index}
                              className="alert alert-danger alert-sm"
                            >
                              <small>
                                File {index + 1}: {error}
                              </small>
                            </div>
                          )
                      )}
                    </div>
                  )}
                </div>
                {/* Image Previews */}
                {(imagePreviews.length > 0 ||
                  urlPreviews.some((preview) => preview)) && (
                  <div className="image-previews mb-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={`file-${index}`} className="image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        {index === 0 && (
                          <span className="primary-badge">Main</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image-btn"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {urlPreviews.map(
                      (preview, index) =>
                        preview && (
                          <div key={`url-${index}`} className="image-preview">
                            <img
                              src={preview}
                              alt={`URL Preview ${index + 1}`}
                            />
                            <span className="url-badge">URL</span>
                            <button
                              type="button"
                              onClick={() => removeUrlField(index)}
                              className="remove-image-btn"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        )
                    )}
                  </div>
                )}
                {/* URL Upload Section */}
                <div className="url-upload-section">
                  <h6>
                    <i className="fas fa-link me-2"></i>
                    Or add images from URL
                  </h6>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="url-input-group mb-2">
                      <div className="input-group">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) =>
                            handleUrlChange(index, e.target.value)
                          }
                          className={`form-control ${
                            urlErrors[index] ? "is-invalid" : ""
                          }`}
                          placeholder="https://example.com/image.jpg"
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
                        <div className="invalid-feedback">
                          {urlErrors[index]}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-plus me-1"></i>Add Another URL
                  </button>
                </div>
              </div>
            </div>
            {/* Specifications Card */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-list-ul me-2"></i>
                  Product Specifications
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Add specific details about your product (optional but
                  recommended)
                </p>
                {specifications.map((spec, index) => (
                  <div key={index} className="specification-row mb-3">
                    <div className="row">
                      <div className="col-md-5">
                        <input
                          type="text"
                          placeholder="Specification (e.g., Brand, Model, Color)"
                          value={spec.name}
                          onChange={(e) =>
                            handleSpecChange(index, "name", e.target.value)
                          }
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-5">
                        <input
                          type="text"
                          placeholder="Value (e.g., Apple, iPhone 12, Black)"
                          value={spec.value}
                          onChange={(e) =>
                            handleSpecChange(index, "value", e.target.value)
                          }
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-2">
                        {specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="btn btn-outline-danger btn-sm w-100"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecification}
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="fas fa-plus me-1"></i>Add Specification
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-lg-4">
            {/* Pricing Card */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  <i className="fas fa-dollar-sign me-2"></i>
                  Pricing
                </h5>
              </div>
              <div className="card-body">
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
                  <small className="form-text text-muted">
                    Show original price to highlight savings
                  </small>
                </div>
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

            {/* Action Buttons Card */}
            <div className="card">
              <div className="card-body">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success btn-lg w-100 mb-3"
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Publishing Product...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Publish Product
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-outline-secondary w-100"
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Cancel
                </button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card mt-4">
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
                    Use clear, high-quality photos
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Write detailed descriptions
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Set competitive prices
                  </li>
                  <li className="mb-0">
                    <i className="fas fa-check text-success me-2"></i>
                    Add product specifications
                  </li>
                </ul>{" "}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
