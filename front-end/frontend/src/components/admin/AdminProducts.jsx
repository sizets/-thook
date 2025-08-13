import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../../context/ShopContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import api from "../../services/api";

const AdminProducts = () => {
  const { products, setProducts } = useContext(ShopContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    description: "",
    image: [""],
    bestseller: false,
    stock: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = ["Premium", "Standard", "Budget"];
  const subCategories = ["10-inch", "11-inch", "12.9-inch", "13-inch"];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.subCategory) {
      newErrors.subCategory = "Sub category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "Stock must be 0 or greater";
    }

    // Validate images
    const validImages = formData.image.filter((url) => url.trim() !== "");
    if (validImages.length === 0) {
      newErrors.image = "At least one image URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.image];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, image: newImages }));

    // Clear image error when user starts typing
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, image: [...prev.image, ""] }));
  };

  const removeImageField = (index) => {
    if (formData.image.length > 1) {
      const newImages = formData.image.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, image: newImages }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    console.log("Editing product:", editingProduct);

    if (!validateForm()) {
      console.log("Form validation failed");
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      // Filter out empty image URLs
      const cleanFormData = {
        ...formData,
        image: formData.image.filter((url) => url.trim() !== ""),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      console.log("Clean form data:", cleanFormData);

      if (editingProduct) {
        if (!editingProduct._id) {
          console.log("Invalid product ID for editing:", editingProduct);
          toast.error("Invalid product ID for editing");
          return;
        }

        console.log("Updating product:", editingProduct._id);
        const response = await api.put(
          `/admin/products/${editingProduct._id}`,
          cleanFormData
        );
        console.log("Update response:", response);
        if (response.data && response.data.product) {
          if (products && Array.isArray(products)) {
            setProducts(
              products.map((product) =>
                product._id === editingProduct._id
                  ? response.data.product
                  : product
              )
            );
          }
          toast.success("Product updated successfully!");
          resetForm();
        }
      } else {
        console.log("Adding new product");
        const response = await api.post("/admin/products", cleanFormData);
        console.log("Add response:", response);
        if (response.data && response.data.product) {
          if (products && Array.isArray(products)) {
            setProducts([...products, response.data.product]);
          } else {
            setProducts([response.data.product]);
          }
          toast.success("Product added successfully!");
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to save product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    console.log("handleDelete called with productId:", productId);
    if (!productId) {
      console.log("Invalid product ID");
      toast.error("Invalid product ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this product?")) {
      console.log("Delete confirmed for product:", productId);
      setDeletingProduct(productId);
      try {
        console.log(
          "Sending delete request to:",
          `/admin/products/${productId}`
        );
        await api.delete(`/admin/products/${productId}`);
        console.log("Delete successful, updating products list");
        // Update the products list by filtering out the deleted product
        if (products && Array.isArray(products)) {
          const updatedProducts = products.filter(
            (product) => product._id !== productId
          );
          console.log("Updated products list:", updatedProducts);
          setProducts(updatedProducts);
        }
        toast.success("Product deleted successfully!");
      } catch (error) {
        console.error("Error in handleDelete:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to delete product";
        toast.error(errorMessage);
      } finally {
        setDeletingProduct(null);
      }
    } else {
      console.log("Delete cancelled by user");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      subCategory: "",
      description: "",
      image: [""],
      bestseller: false,
      stock: "",
    });
    setErrors({});
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const startEdit = (product) => {
    console.log("startEdit called with product:", product);
    if (!product || !product._id) {
      console.log("Invalid product data:", product);
      toast.error("Invalid product data");
      return;
    }

    // Immediately populate the form data
    const formDataToSet = {
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      description: product.description || "",
      image:
        product.image && product.image.length > 0 ? [...product.image] : [""],
      bestseller: product.bestseller || false,
      stock: product.stock || "",
    };

    console.log("Setting form data:", formDataToSet);
    setFormData(formDataToSet);

    setEditingProduct(product);
    setShowAddForm(true);
    setErrors({});
    console.log("Edit mode activated for product:", product._id);
  };

  const cancelEdit = () => {
    if (editingProduct) {
      // If we're editing, reset to add mode
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        category: "",
        subCategory: "",
        description: "",
        image: [""],
        bestseller: false,
        stock: "",
      });
      setErrors({});
      setShowAddForm(false);
    } else {
      // If we're adding, just hide the form
      setShowAddForm(false);
      setErrors({});
    }
  };

  const refreshProducts = async () => {
    console.log("refreshProducts called");
    setIsRefreshing(true);
    try {
      console.log("Fetching products from /admin/products");
      const response = await api.get("/admin/products");
      console.log("Refresh response:", response);
      if (response.data && response.data.products) {
        console.log("Setting products from response:", response.data.products);
        setProducts(response.data.products);
        toast.success("Product list refreshed!");
      } else if (response.data && response.data.tablets) {
        // Fallback for the tablets endpoint
        console.log(
          "Using fallback tablets endpoint, setting products:",
          response.data.tablets
        );
        setProducts(response.data.tablets);
        toast.success("Product list refreshed!");
      } else {
        console.log("No products or tablets found in response");
      }
    } catch (error) {
      console.error("Error in refreshProducts:", error);
      toast.error("Failed to refresh products");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Product Management
          </h2>
          <span className="text-sm text-gray-600">
            Total Products:{" "}
            {products && Array.isArray(products) ? products.length : 0}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              console.log("Add Product button clicked");
              setEditingProduct(null);
              const emptyFormData = {
                name: "",
                price: "",
                category: "",
                subCategory: "",
                description: "",
                image: [""],
                bestseller: false,
                stock: "",
              };
              console.log("Setting empty form data:", emptyFormData);
              setFormData(emptyFormData);
              setErrors({});
              setShowAddForm(true);
              console.log("Add form should now be visible");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="bestseller"
                  checked={formData.bestseller}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Bestseller
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              {formData.image.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formData.image.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
              <button
                type="button"
                onClick={addImageField}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                + Add Image
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products && Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id || `product-${Math.random()}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={
                          product.image && product.image.length > 0
                            ? product.image[0]
                            : "/placeholder-image.jpg"
                        }
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name || "Unnamed Product"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.subCategory || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price !== undefined ? product.price : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock !== undefined ? product.stock : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.bestseller === true
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.bestseller === true ? "Bestseller" : "Standard"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      disabled={!product._id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={deletingProduct === product._id || !product._id}
                    >
                      {deletingProduct === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {!products
                    ? "Loading products..."
                    : Array.isArray(products) && products.length === 0
                    ? "No products found"
                    : "Error loading products"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
