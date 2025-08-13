import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { navigate, placeOrder, user, cartItems } = useContext(ShopContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    // Validate shipping address
    if (
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.phone
    ) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    // Check if cart has items
    if (
      !cartItems ||
      (Array.isArray(cartItems) && cartItems.length === 0) ||
      (typeof cartItems === "object" && Object.keys(cartItems).length === 0)
    ) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        shippingAddress,
        paymentMethod: method,
      };

      const response = await placeOrder(orderData);
      if (response && response.success) {
        toast.success("Order placed successfully! Redirecting to orders...");
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side - Shipping Address */}
      <div className="flex-1 max-w-2xl">
        <div className="mt-8">
          <Title text1={"SHIPPING"} text2={"ADDRESS"} />
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your street address"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter state"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ZIP code"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Content */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        {/* Payment Methods Selection */}
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHODS"} />
          <div className="flex flex-col gap-3 lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 p-2 px-3 border cursor-pointer hover:border-blue-500 transition-colors"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-600" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 p-2 px-3 border cursor-pointer hover:border-blue-500 transition-colors"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-green-600" : ""
                }`}
              ></p>
              <img
                className="h-5 mx-4"
                src={assets.razorpay_logo}
                alt="RazorPay"
              />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 p-2 px-3 border cursor-pointer hover:border-blue-500 transition-colors"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-600" : ""
                }`}
              ></p>
              <p className="mx-4 text-sm font-medium text-gray-500">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
          <div className="w-full mt-8 text-end">
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className={`px-16 py-3 text-sm text-white bg-black active:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${
                isProcessing ? "opacity-75" : ""
              }`}
            >
              {isProcessing ? "PROCESSING..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
