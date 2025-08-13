import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // Get unique categories and subcategories from products
  const uniqueCategories = [...new Set(products.map(item => item.category))];
  const uniqueSubCategories = [...new Set(products.map(item => item.subCategory))];

  return (
    <div className="flex flex-col gap-1 pt-10 border-t sm:flex-row sm:gap-10">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="Dropdown"
          />
        </p>
        {/* Category Filters */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {uniqueCategories.map((cat) => (
              <label key={cat} className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value={cat}
                  onChange={toggleCategory}
                  checked={category.includes(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>
        {/* Sub Category Filters */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {uniqueSubCategories.map((subCat) => (
              <label key={subCat} className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value={subCat}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes(subCat)}
                />
                {subCat}
              </label>
            ))}
          </div>
        </div>
        {/* Clear Filters Button */}
        <button
          className={`px-4 py-2 mt-1 text-white bg-black rounded hover:bg-gray-900 ${
            showFilter ? "block" : "hidden"
          } sm:block`}
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* View Product Items */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1={"TABLET"} text2={"COLLECTIONS"} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 text-sm border-2 border-gray-300"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/* Map Products */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              image={item.image}
              price={item.price}
            />
          ))}
        </div>
        {filterProducts.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>No tablets found matching your criteria.</p>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
