'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct, saveProduct, getCategories } from '@/lib/data-service';
import { Product, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Star, Check, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AdminProductsPage() {
  const { addToast } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodList, catList] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNew = () => {
    setEditingProduct({
      name: '',
      price: 299,
      compare_at_price: 399,
      category_id: categories[0]?.id || 'cat-1',
      stock: 10,
      description: '',
      short_description: '',
      made_to_order: false,
      preparation_time: 'Ready to Ship (Dispatched in 24 hrs)',
      materials: '100% Cotton Yarn',
      dimensions: 'Standard Size',
      care_instructions: 'Gentle hand wash in cold water.',
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: '',
          url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
          alt_text: 'Crochet Product',
          is_primary: true,
          sort_order: 1
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      addToast('info', 'Product deleted from database.');
      loadData();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      addToast('error', 'Please fill in product name and price.');
      return;
    }

    await saveProduct(editingProduct);
    addToast('success', 'Product saved successfully to database!');
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Products Catalog</h1>
            <p className="text-xs text-gray-500">Manage real crochet items, prices, stock, and made-to-order settings</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-[#C86D51] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-[#B0583E] transition-colors shadow"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading catalog data...</div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E8DEC9] text-center space-y-3">
            <p className="font-serif text-lg text-gray-600">No products found in database.</p>
            <button onClick={handleOpenNew} className="px-4 py-2 bg-[#C86D51] text-white text-xs font-semibold rounded-xl">
              Create First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E8DEC9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF4E8] text-gray-700 uppercase font-semibold border-b border-[#E8DEC9]">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-[#1A1A1A]">{p.name}</td>
                      <td className="p-4 font-bold text-[#1A1A1A]">{formatCurrency(p.price)}</td>
                      <td className="p-4">{p.stock} units</td>
                      <td className="p-4">
                        {p.made_to_order ? (
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-medium">Made to Order</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium">Ready to Ship</span>
                        )}
                      </td>
                      <td className="p-4 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> {p.rating || 5.0}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-600 hover:text-[#C86D51]">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating / Editing Product */}
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-4">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Compare-At Price (MRP ₹)</label>
                    <input
                      type="number"
                      value={editingProduct.compare_at_price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Availability Type</label>
                    <select
                      value={editingProduct.made_to_order ? 'made' : 'ready'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, made_to_order: e.target.value === 'made' })}
                      className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                    >
                      <option value="ready">Ready to Ship (24h)</option>
                      <option value="made">Made to Order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.images?.[0]?.url || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [
                          {
                            id: `img-${Date.now()}`,
                            product_id: editingProduct.id || '',
                            url: e.target.value,
                            alt_text: editingProduct.name || 'Product Image',
                            is_primary: true,
                            sort_order: 1
                          }
                        ]
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DEC9]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#C86D51] text-white rounded-xl font-semibold shadow">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
