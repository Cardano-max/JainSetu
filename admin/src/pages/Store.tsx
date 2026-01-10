import { useEffect, useState } from 'react';
import { PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/store/products?limit=50');
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store</h1>
          <p className="text-gray-500">Manage products and orders</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Product</th>
                <th className="table-header">Category</th>
                <th className="table-header">Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-saffron-600 mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.isFeatured && (
                            <span className="text-xs text-saffron-600">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{product.category?.name || '-'}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">₹{product.price}</p>
                        {product.comparePrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ₹{product.comparePrice}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`${
                          product.quantity > 10
                            ? 'text-green-600'
                            : product.quantity > 0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td className="table-cell">
                      {product.isActive ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-danger">Inactive</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button className="text-sm text-saffron-600 hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
