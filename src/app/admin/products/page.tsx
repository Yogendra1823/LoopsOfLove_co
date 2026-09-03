'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, deleteProduct, saveProduct, getCategories } from '@/lib/data-service';
import { Product, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Star, Check, X, UploadCloud, Link as LinkIcon, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AdminProductsPage() {
  const { addToast } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          sort_order: 1,
        },
      ],
    });
    setImageMode('upload');
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : [
        {
          id: `img-${Date.now()}`,
          product_id: p.id,
          url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
          alt_text: p.name,
          is_primary: true,
          sort_order: 1,
        },
      ],
    });
    setImageMode(p.images?.[0]?.url?.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      addToast('info', 'Product deleted from database.');
      loadData();
    }
  };

  // Image File Handling (Base64 conversion with file reader)
  const handleFileChange = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Image file size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [
            {
              id: `img-${Date.now()}`,
              product_id: editingProduct.id || '',
              url: dataUrl,
              alt_text: editingProduct.name || file.name.split('.')[0] || 'Product Image',
              is_primary: true,
              sort_order: 1,
            },
          ],
        });
        addToast('success', 'Image file selected successfully!');
      }
    };
    reader.onerror = () => {
      addToast('error', 'Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        images: [],
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      addToast('error', 'Please fill in product name and price.');
      return;
    }

    if (!editingProduct.images || editingProduct.images.length === 0 || !editingProduct.images[0]?.url) {
      addToast('error', 'Please upload an image or provide an image URL for the product.');
      return;
    }

    await saveProduct(editingProduct);
    addToast('success', 'Product saved successfully to database!');
    setIsModalOpen(false);
    loadData();
  };

  const currentImageUrl = editingProduct?.images?.[0]?.url;

  return (
    <div className="py-8 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Products Catalog</h1>
            <p className="text-xs text-gray-500">Manage real crochet items, images, prices, stock, and made-to-order settings</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-[#C86D51] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-[#B0583E] transition-colors shadow"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {/* Product Table */}
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
                    <th className="p-4">Item</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6]">
                  {products.map((p) => {
                    const imgUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF4E8] border border-[#E8DEC9] overflow-hidden relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating / Editing Product */}
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-[#E8DEC9]">
              <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-[11px] text-gray-500">Configure details, upload photo, and set inventory</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Handmade Rose & Daisy Bouquet"
                    className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                {/* Category & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={editingProduct.category_id || categories[0]?.id || 'cat-1'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Availability Type</label>
                    <select
                      value={editingProduct.made_to_order ? 'made' : 'ready'}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          made_to_order: e.target.value === 'made',
                          preparation_time:
                            e.target.value === 'made'
                              ? 'Made to Order (Crafted in 3-5 days)'
                              : 'Ready to Ship (Dispatched in 24 hrs)',
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    >
                      <option value="ready">Ready to Ship (24h Dispatch)</option>
                      <option value="made">Made to Order (Custom Crafted)</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      placeholder="299"
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">MRP / Compare Price (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.compare_at_price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: Number(e.target.value) })}
                      placeholder="399"
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingProduct.stock ?? 10}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                    />
                  </div>
                </div>

                {/* ── Product Image Upload & URL Selection Section ── */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-gray-700">
                      Product Image *
                    </label>
                    {/* Toggle between Upload File and Image URL */}
                    <div className="flex items-center gap-1 bg-[#FAF4E8] p-1 rounded-xl border border-[#E8DEC9] text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                          imageMode === 'upload'
                            ? 'bg-[#C86D51] text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                          imageMode === 'url'
                            ? 'bg-[#C86D51] text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" /> Image URL
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: File Upload / Drag & Drop */}
                  {imageMode === 'upload' ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                        isDragging
                          ? 'border-[#C86D51] bg-[#C86D51]/10'
                          : 'border-[#E8DEC9] bg-[#FAF4E8]/50 hover:bg-[#FAF4E8]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="w-12 h-12 bg-white rounded-full border border-[#E8DEC9] text-[#C86D51] flex items-center justify-center mx-auto mb-2 shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-gray-800 text-xs">
                        Click to choose file or drag & drop image here
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Supports PNG, JPG, WebP, GIF (Max 5MB)
                      </p>
                    </div>
                  ) : (
                    /* Mode 2: Direct Image URL */
                    <div>
                      <input
                        type="url"
                        value={currentImageUrl || ''}
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
                                sort_order: 1,
                              },
                            ],
                          })
                        }
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                      />
                    </div>
                  )}

                  {/* Live Image Preview Card */}
                  {currentImageUrl && (
                    <div className="flex items-center gap-3 p-3 bg-[#FAF4E8] rounded-2xl border border-[#E8DEC9]">
                      <div className="w-14 h-14 rounded-xl bg-white border border-[#E8DEC9] overflow-hidden relative shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentImageUrl}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-xs truncate">
                          {currentImageUrl.startsWith('data:') ? 'Uploaded Image File' : currentImageUrl}
                        </p>
                        <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                          <Check className="w-3 h-3" /> Image attached & ready
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        title="Remove Image"
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-white/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Describe yarn material, dimensions, ideal gifting occasion..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DEC9]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#C86D51] text-white rounded-xl font-semibold shadow hover:bg-[#B0583E] transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Product
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
