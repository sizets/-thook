import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Orders = () => {
  const { userOrders, user, currency } = useContext(ShopContext);

  if (!user) {
    return (
      <div className="pt-16 border-t">
        <div className="text-2xl">
          <Title text1={"YOUR"} text2={"ORDERS"} />
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">Please login to view your orders.</p>
        </div>
      </div>
    );
  }

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="pt-16 border-t">
        <div className="text-2xl">
          <Title text1={"YOUR"} text2={"ORDERS"} />
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">
            No orders found. Start shopping to place your first order!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="pt-16 border-t">
      <div className="text-2xl">
        <Title text1={"YOUR"} text2={"ORDERS"} />
      </div>
      <div className="space-y-4">
        {userOrders.map((order, index) => (
          <div
            key={order._id || index}
            className="flex flex-col gap-4 py-6 text-gray-700 border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">
                    Order #{order._id?.slice(-8) || "N/A"}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Placed on: {formatDate(order.createdAt)}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Payment Method: {order.paymentMethod?.toUpperCase() || "N/A"}
                </p>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items?.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
                    >
                      <img
                        className="w-16 h-16 object-cover rounded"
                        src={
                          item.product?.image?.[0] || "/placeholder-image.jpg"
                        }
                        alt={item.product?.name || "Product"}
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.product?.name || "Product Name"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Size: {item.size}</span>
                          <span>Qty: {item.quantity}</span>
                          <span className="font-medium">
                            {currency}
                            {item.product?.price?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-sm text-blue-900 mb-2">
                      Shipping Address:
                    </h4>
                    <p className="text-sm text-blue-800">
                      {order.shippingAddress.fullName}
                      <br />
                      {order.shippingAddress.address}
                      <br />
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                      <br />
                      Phone: {order.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3 md:w-48">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Subtotal:</p>
                  <p className="font-medium">
                    {currency}
                    {order.total?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600">Delivery Fee:</p>
                  <p className="font-medium">
                    {currency}
                    {order.deliveryFee?.toFixed(2) || "0.00"}
                  </p>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="text-lg font-bold">
                      {currency}
                      {order.finalTotal?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>

                <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50 transition-colors">
                  TRACK ORDER
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
