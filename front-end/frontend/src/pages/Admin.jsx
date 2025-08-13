import React, { useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import AdminProducts from "../components/admin/AdminProducts";
import AdminUsers from "../components/admin/AdminUsers";
import AdminOrders from "../components/admin/AdminOrders";
import AdminStats from "../components/admin/AdminStats";

const Admin = () => {
  const { user } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("stats");

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "stats", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "📱" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "orders", label: "Orders", icon: "📦" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "stats":
        return <AdminStats onTabChange={setActiveTab} />;
      case "products":
        return <AdminProducts />;
      case "add-product":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "orders":
        return <AdminOrders />;
      default:
        return <AdminStats onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">
                Manage your e-commerce platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <img
                src={user.profileImage || assets.profile_icon}
                alt="Admin"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Admin;
