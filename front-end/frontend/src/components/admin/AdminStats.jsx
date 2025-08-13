import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from "../../context/ShopContext";
import api from "../../services/api";
import { toast } from "react-toastify";

const AdminStats = ({ onTabChange }) => {
  const { products } = useContext(ShopContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (tabId) => {
    if (onTabChange) {
      // Show success toast based on the action
      const actionNames = {
        "add-product": "Navigating to Add Product",
        products: "Navigating to Products",
        orders: "Navigating to Orders",
        users: "Navigating to Users",
      };

      if (actionNames[tabId]) {
        toast.success(actionNames[tabId]);
      }

      onTabChange(tabId);
    }
  };

  const calculateBasicStats = () => {
    const totalProducts = products.length;
    const bestsellerProducts = products.filter((p) => p.bestseller).length;
    const premiumProducts = products.filter(
      (p) => p.category === "Premium"
    ).length;
    const lowStockProducts = products.filter((p) => p.stock < 10).length;

    return {
      totalProducts,
      bestsellerProducts,
      premiumProducts,
      lowStockProducts,
    };
  };

  const basicStats = calculateBasicStats();

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalRevenue?.toFixed(2) || "0.00"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {basicStats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Product Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Bestseller Products
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {basicStats.bestsellerProducts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Premium Products</span>
                <span className="text-sm font-medium text-gray-900">
                  {basicStats.premiumProducts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Low Stock Products
                </span>
                <span className="text-sm font-medium text-gray-900">
                  <span className="text-red-600">
                    {basicStats.lowStockProducts}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm transition-colors duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
                onClick={() => handleQuickAction("products")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span>View All Products</span>
              </button>
              <button
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm transition-colors duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
                onClick={() => handleQuickAction("orders")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>View All Orders</span>
              </button>
              <button
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm transition-colors duration-200 transform hover:scale-105 hover:shadow-md flex items-center justify-center space-x-2"
                onClick={() => handleQuickAction("users")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <span>Manage Users</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id?.slice(-8) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.user?.name || "Guest"} - $
                      {order.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent orders to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
