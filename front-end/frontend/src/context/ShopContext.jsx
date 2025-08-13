import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getTablets,
  getBestsellers,
  addToCart,
  getCart,
  updateCartItem,
  clearCart,
  getCurrentUser,
  logout,
  checkout,
  getUserOrders,
} from "../services/api";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const navigate = useNavigate();

  const currency = "$";
  const delivery_fee = 10;

  // Load products from API
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        // Check authentication first
        await checkAuthStatus();
        // Then load products and bestsellers
        await Promise.all([loadProducts(), loadBestsellers()]);
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load cart from API if user is authenticated
  useEffect(() => {
    if (user) {
      loadCartFromAPI();
      loadUserOrders();
    } else {
      // Load cart from localStorage for guest users
      try {
        const storedCartItems = JSON.parse(localStorage.getItem("cartItems"));
        if (
          storedCartItems &&
          typeof storedCartItems === "object" &&
          Object.keys(storedCartItems).length > 0
        ) {
          // Validate the stored cart data
          let isValidCart = true;
          for (const productId in storedCartItems) {
            if (
              typeof storedCartItems[productId] !== "object" ||
              !storedCartItems[productId]
            ) {
              isValidCart = false;
              break;
            }
            for (const size in storedCartItems[productId]) {
              if (
                typeof storedCartItems[productId][size] !== "number" ||
                storedCartItems[productId][size] <= 0
              ) {
                isValidCart = false;
                break;
              }
            }
          }

          if (isValidCart) {
            setCartItems(storedCartItems);
          } else {
            // Clear invalid cart data
            localStorage.removeItem("cartItems");
            setCartItems({});
          }
        } else {
          setCartItems({});
        }
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        localStorage.removeItem("cartItems");
        setCartItems({});
      }
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      const response = await getUserOrders();
      if (response.success) {
        setUserOrders(response.orders || []);
      }
    } catch (error) {
      console.error("Error loading user orders:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getTablets();
      if (response.success) {
        setProducts(response.tablets);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  const loadBestsellers = async () => {
    try {
      const response = await getBestsellers();
      if (response.success) {
        setBestsellers(response.bestsellers);
      }
    } catch (error) {
      console.error("Error loading bestsellers:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.user);
        console.log("User authenticated:", response.user);
      } else {
        setUser(null);
        console.log("User not authenticated");
      }
    } catch (error) {
      // User not authenticated
      setUser(null);
      console.log("Authentication check failed:", error);
    }
  };

  const loadCartFromAPI = async () => {
    try {
      const response = await getCart();
      if (response.success) {
        // For authenticated users, keep cartItems as an array from the API
        // The API returns cart items with product data embedded
        setCartItems(response.cart || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      // This will be handled by the Login component
      // After successful login, checkAuthStatus will be called
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setCartItems({}); // Reset to guest cart structure
      localStorage.removeItem("cartItems");
      localStorage.removeItem("token"); // Clear the auth token
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addToCartHandler = async (itemId, size) => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }

    try {
      if (user) {
        // User is authenticated, use API
        const response = await addToCart(itemId, size, 1);
        if (response.success) {
          // Update local cart state - for authenticated users, cartItems is an array
          let cartData = structuredClone(cartItems);
          const existingItemIndex = cartData.findIndex(
            (item) => item._id === itemId && item.size === size
          );

          if (existingItemIndex !== -1) {
            // Item already exists, increment quantity
            cartData[existingItemIndex].quantity += 1;
          } else {
            // Add new item - we need to get product data
            const product = products.find((p) => p._id === itemId);
            if (product) {
              cartData.push({
                _id: itemId,
                size: size,
                quantity: 1,
                product: product,
              });
            }
          }
          setCartItems(cartData);
          toast.success("Item Added To The Cart");
        }
      } else {
        // Guest user, use localStorage
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
          if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
          } else {
            cartData[itemId][size] = 1;
          }
        } else {
          cartData[itemId] = {};
          cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        toast.success("Item Added To The Cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const getCartCount = () => {
    let totalCount = 0;

    if (user && Array.isArray(cartItems)) {
      // For authenticated users, cartItems is an array
      cartItems.forEach((item) => {
        if (item && item.quantity > 0) {
          totalCount += item.quantity;
        }
      });
    } else if (!user && cartItems && typeof cartItems === "object") {
      // For guest users, cartItems is an object with nested structure
      for (const items in cartItems) {
        if (cartItems[items] && typeof cartItems[items] === "object") {
          for (const item in cartItems[items]) {
            try {
              if (cartItems[items][item] > 0) {
                totalCount += cartItems[items][item];
              }
            } catch (error) {
              // INFO: Error Handling
            }
          }
        }
      }
    }

    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    try {
      if (user) {
        // User is authenticated, use API
        const response = await updateCartItem(itemId, size, quantity);
        if (response.success) {
          // Update local cart state - for authenticated users, cartItems is an array
          let cartData = structuredClone(cartItems);
          const itemIndex = cartData.findIndex(
            (item) => item._id === itemId && item.size === size
          );

          if (quantity === 0) {
            // Remove item
            if (itemIndex !== -1) {
              cartData.splice(itemIndex, 1);
            }
            toast.success("Item Removed From The Cart");
          } else {
            // Update quantity
            if (itemIndex !== -1) {
              cartData[itemIndex].quantity = quantity;
            }
          }
          setCartItems(cartData);
        }
      } else {
        // Guest user, use localStorage
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
          }
          toast.success("Item Removed From The Cart");
        } else {
          cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart");
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    if (user && Array.isArray(cartItems)) {
      // For authenticated users, cartItems is an array with product data
      cartItems.forEach((item) => {
        if (item.quantity > 0 && item.product && item.product.price) {
          totalAmount += item.product.price * item.quantity;
        }
      });
    } else {
      // For guest users, cartItems is an object with nested structure
      for (const items in cartItems) {
        let itemInfo = products.find((product) => product._id === items);
        if (itemInfo) {
          for (const item in cartItems[items]) {
            try {
              if (cartItems[items][item] > 0) {
                totalAmount += itemInfo.price * cartItems[items][item];
              }
            } catch (error) {}
          }
        }
      }
    }

    return totalAmount;
  };

  const clearCartHandler = async () => {
    try {
      if (user) {
        await clearCart();
        setCartItems([]); // For authenticated users, cartItems is an array
      } else {
        setCartItems({}); // For guest users, cartItems is an object
        localStorage.removeItem("cartItems");
      }
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const placeOrder = async (orderData) => {
    try {
      if (!user) {
        toast.error("Please login to place an order");
        return { success: false };
      }

      const response = await checkout(orderData);
      if (response.success) {
        toast.success("Order placed successfully!");
        // Clear cart after successful order
        if (Array.isArray(cartItems)) {
          setCartItems([]);
        } else {
          setCartItems({});
        }
        localStorage.removeItem("cartItems");
        // Refresh user orders
        await loadUserOrders();
        return response;
      } else {
        toast.error(response.message || "Failed to place order");
        return response;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
      return { success: false, message: error.message };
    }
  };

  const value = {
    products,
    setProducts,
    bestsellers,
    loading,
    user,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart: addToCartHandler,
    getCartCount,
    updateQuantity,
    getCartAmount,
    clearCart: clearCartHandler,
    handleLogin,
    handleLogout,
    checkAuthStatus,
    navigate,
    placeOrder,
    userOrders,
    loadUserOrders,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
