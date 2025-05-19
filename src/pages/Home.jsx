import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import styles from "./home.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // New: State to manage loading status
  const [error, setError] = useState(null); // New: State to manage fetch errors

  const navigate = useNavigate();
  const userID = sessionStorage.getItem("userID");

  useEffect(() => {
    setLoading(true); // Start loading
    setError(null); // Clear any previous errors

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/products/approved`)
      .then((res) => {
        console.log("Fetched Products:", res.data);
        setProducts(res.data);
        setLoading(false); // End loading on success
      })
      .catch((err) => {
        console.error("Error fetching approved products:", err);
        setError("Failed to load products. Please try again later."); // Set user-friendly error message
        setLoading(false); // End loading on error
      });
  }, []); // Empty dependency array means this runs once on component mount

  // Extract unique categories (case-insensitive)
  const uniqueCategories = [
    ...new Set(products.map((p) => p.category?.toLowerCase())),
  ];

  // Featured carousel settings: 4 products, autoplay, no dots
  const featuredSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  // Category carousel settings: 7 products, no autoplay, with arrows
  const categorySettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  // Function to render product cards
  const renderProductCard = (product, isFeatured = false) => (
    <div
      key={product.id} // Ensure product.id is unique and stable
      className={isFeatured ? styles.featuredCard : styles.productCard}
      onClick={() =>
        userID ? navigate(`/products/${product.id}`) : navigate("/login")
      }
    >
      {product.productImageBase64 ? (
        <img
          src={`data:image/jpeg;base64,${product.productImageBase64}`}
          alt={product.name || "Product image"} // Added fallback alt text for accessibility
          className={isFeatured ? styles.featuredImage : styles.productImage}
          onError={(e) => {
            e.target.src = "/flash.png"; // Fallback if base64 is invalid
            e.target.alt = "Image not found"; // Update alt text on error
          }}
        />
      ) : (
        <img
          src="/flash.png"
          alt="Placeholder image" // More descriptive alt text for placeholder
          // Apply appropriate styles depending on context
          className={isFeatured ? styles.featuredImage : styles.productImage}
        />
      )}
      {!isFeatured && (
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productPrice}>₹{product.price}</p>
        </div>
      )}
    </div>
  );

  return (
    <section className={styles.homeContainer}>
      {loading ? (
        // Display loading message while products are being fetched
        <p>Loading products...</p>
      ) : error ? (
        // Display error message if fetching failed
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : products.length === 0 ? (
        // Display message if no products are found after loading
        <p style={{ textAlign: "center" }}>
          No products available at the moment.
        </p>
      ) : (
        // Render carousels once products are loaded and no error
        <>
          {/* Featured Products Carousel */}
          <header className={styles.featuredHeader}>
            <h2>Featured Products</h2>
          </header>
          <div className={styles.featuredCarousel}>
            <Slider {...featuredSettings}>
              {products.map((product) => renderProductCard(product, true))}
            </Slider>
          </div>

          {/* Category-wise Carousels */}
          {uniqueCategories.map((cat) => {
            const categoryProducts = products.filter(
              (p) => p.category?.toLowerCase() === cat
            );
            if (categoryProducts.length === 0) return null; // Don't render empty categories
            return (
              <section key={cat} className={styles.categorySection}>
                <h2>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>
                <Slider {...categorySettings}>
                  {categoryProducts.map((product) =>
                    renderProductCard(product)
                  )}
                </Slider>
              </section>
            );
          })}
        </>
      )}
    </section>
  );
};

export default Home;
