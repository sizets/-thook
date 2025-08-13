import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, user, loading } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (loading) return; // Wait for data to load

    const tempData = [];
    if (user) {
      // For authenticated users, cartItems should be an array from the API
      if (Array.isArray(cartItems)) {
        setCartData(cartItems);
      } else {
        setCartData([]);
      }
    } else {
      // For guest users, cartItems is an object with nested structure
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, user, loading]);

  const isCartEmpty = cartData.length === 0;

  // Function to find product data
  const findProductData = (itemId) => {
    if (user && Array.isArray(cartItems)) {
      // For authenticated users, the cart item already contains product data
      return cartItems.find(item => item._id === itemId)?.product || null;
    } else {
      // For guest users, find in products array
      return products.find((product) => product._id === itemId);
    }
  };

  if (loading) {
    return (
      <div className='border-t pt-14'>
        <div className='mb-3 text-2xl'>
          <Title text1={'YOUR'} text2={'CART'} />
        </div>
        <div className='text-center py-20'>
          <p className='text-gray-500'>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14'>
      <div className='mb-3 text-2xl'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>
      
      {isCartEmpty ? (
        <div className='text-center py-20'>
          <p className='text-gray-500 text-lg mb-4'>Your cart is empty</p>
          <button 
            onClick={() => navigate('/collection')} 
            className='px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors'
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartData.map((item, index) => {
              const productData = findProductData(item._id);

              if (!productData) {
                return (
                  <div key={index} className='py-4 text-center text-gray-500 border-t border-b'>
                    Product not found
                  </div>
                );
              }

              return (
                <div key={index} className='grid py-4 text-gray-700 border-t border-b grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className='flex items-start gap-6'>
                    <img 
                      className='w-16 sm:w-20' 
                      src={Array.isArray(productData.image) ? productData.image[0] : productData.image} 
                      alt="Photo" 
                    />
                    <div>
                      <p className='text-sm font-medium sm:text-lg'>{productData.name}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>
                          {currency}&nbsp;{productData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className='px-2 border sm:px-3 sm:py-1 bg-slate-50'>{item.size}</p>
                      </div>
                    </div>
                  </div>
                  <input
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        updateQuantity(item._id, item.size, 0);
                      } else {
                        updateQuantity(item._id, item.size, Number(value));
                      }
                    }} 
                    className='px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2' 
                    type="number" 
                    min={1} 
                    defaultValue={item.quantity} 
                  />
                  <img 
                    onClick={() => updateQuantity(item._id, item.size, 0)} 
                    className='w-4 mr-4 cursor-pointer sm:w-5' 
                    src={assets.bin_icon} 
                    alt="Remove" 
                  />
                </div>
              );
            })}
          </div>
          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-[450px]'>
              <CartTotal />
              <div className='w-full text-end'>
                <button 
                  onClick={() => navigate('/place-order')} 
                  className='px-8 py-3 my-8 text-sm text-white bg-black active:bg-gray-700 hover:bg-gray-800 transition-colors'
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
