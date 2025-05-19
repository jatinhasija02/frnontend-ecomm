import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import styles from "./home.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const userID = sessionStorage.getItem("userID");

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/products/approved`)
      .then((res) => {
        console.log("Fetched Products:", res.data);
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching approved products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  const uniqueCategories = [
    ...new Set(products.map((p) => p.category?.toLowerCase())),
  ];

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

  const renderProductCard = (product, isFeatured = false) => {
    // Dynamically determine the MIME type from the product object
    // Provide a fallback if for some reason the MIME type isn't available
    const imageMimeType = product.productImageMimeType || "image/jpeg";

    return (
      <div
        key={product.id}
        className={isFeatured ? styles.featuredCard : styles.productCard}
        onClick={() =>
          userID ? navigate(`/products/${product.id}`) : navigate("/login")
        }
      >
        {product.productImageBase64 ? (
          <img
            // Use the dynamic imageMimeType here
            src={`data:${imageMimeType};base64,${product.productImageBase64}`}
            alt={product.name || "Product image"}
            className={isFeatured ? styles.featuredImage : styles.productImage}
            onError={(e) => {
              e.target.src = "/flash.png";
              e.target.alt = "Image not found";
            }}
          />
        ) : (
          <img
            src="/flash.png"
            alt="Placeholder image"
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
  };

  return (
    <section className={styles.homeContainer}>
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          No products available at the moment.
        </p>
      ) : (
        <>
          <header className={styles.featuredHeader}>
            <h2>Featured Products</h2>
          </header>
          <div className={styles.featuredCarousel}>
            <Slider {...featuredSettings}>
              {products.map((product) => renderProductCard(product, true))}
            </Slider>
          </div>

          {uniqueCategories.map((cat) => {
            const categoryProducts = products.filter(
              (p) => p.category?.toLowerCase() === cat
            );
            if (categoryProducts.length === 0) return null;
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
