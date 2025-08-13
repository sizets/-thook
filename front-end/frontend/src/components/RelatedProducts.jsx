import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'

const RelatedProducts = ({category, subCategory}) => {

    const {products} = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => category === item.category);
            productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);
            setRelated(productsCopy.slice(0, 4));
        }
    }, [products, category, subCategory]);

  return (
    <div className='my-24'>
        <div className='py-2 text-3xl text-center'>
            <Title text1={'RELATED'} text2={'TABLETS'} />
        </div>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 gap-y-6'>
            {related.map((item, index) => (
                <ProductItem
                    key={index}
                    id={item._id}
                    name={item.name}
                    image={item.image}
                    price={item.price}
                />
            ))}
        </div>
        {related.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>No related tablets found.</p>
            </div>
        )}
    </div>
  )
}

export default RelatedProducts
