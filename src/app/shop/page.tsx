'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/data-service';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, Sparkles, PackageX, SlidersHorizontal, Grid3X3, LayoutList, X, Flame } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [filterType, setFilterType] = useState<'all' | 'ready-to-ship' | 'made-to-order'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodList, catList] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodList);
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load shop data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category?.slug === selectedCategory;

        const matchesSearch =
          !searchQuery.trim() ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilterType =
          filterType === 'all' ||
          (filterType === 'ready-to-ship' && !product.made_to_order) ||
          (filterType === 'made-to-order' && product.made_to_order);

        const matchesPrice = product.price <= maxPrice;

        return matchesCategory && matchesSearch && matchesFilterType && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, filterType, maxPrice]);

  const hasActiveFilters =
    selectedCategory !== 'all' || searchQuery !== '' || filterType !== 'all' || maxPrice < 3000;

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setFilterType('all');
    setMaxPrice(3000);
    setSortBy('featured');
  };

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 100% Handcrafted Studio Catalog
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
            Explore All Crochet Creations
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Browse our complete range of handmade crochet flower bouquets, bag keychains, amigurumi toys, and festival home decor.
          </p>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-4">
          {/* Search, Sort, View Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search handmade pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-2xl focus:outline-none focus:border-[#C86D51]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl text-gray-700 font-medium focus:outline-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated ★</option>
              </select>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl text-gray-700 font-medium focus:outline-none"
              >
                <option value="all">Availability: All</option>
                <option value="ready-to-ship">Ready to Ship (24h)</option>
                <option value="made-to-order">Made to Order</option>
              </select>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-[#FAF4E8] p-1 rounded-xl border border-[#E8DEC9]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-[#C86D51] shadow-sm' : 'text-gray-500 hover:text-black'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white text-[#C86D51] shadow-sm' : 'text-gray-500 hover:text-black'
                  }`}
                  title="List View"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Price Range Slider */}
          <div className="pt-2 border-t border-[#F4EFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">Max Price:</span>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-36 accent-[#C86D51] cursor-pointer"
              />
              <span className="font-bold text-[#1A1A1A] bg-[#FAF4E8] px-2.5 py-0.5 rounded-lg border border-[#E8DEC9]">
                {formatCurrency(maxPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                Showing <strong>{filteredProducts.length}</strong> of {products.length} creations
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#C86D51] font-semibold hover:underline flex items-center gap-1 ml-2"
                >
                  <X className="w-3 h-3" /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 border-t border-[#F4EFE6] scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'bg-[#FAF4E8] text-gray-700 hover:bg-[#E8DEC9]/60'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category?.slug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all shrink-0 ${
                    selectedCategory === cat.slug
                      ? 'bg-[#1A1A1A] text-white shadow-sm'
                      : 'bg-[#FAF4E8] text-gray-700 hover:bg-[#E8DEC9]/60'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid / List */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-[#E8DEC9] animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DEC9] p-8 max-w-lg mx-auto shadow-sm">
            <PackageX className="w-12 h-12 text-[#C86D51] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-2">
              No handmade pieces added yet.
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Our studio is crafting new pieces right now. Please check back soon or place a custom order!
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8DEC9] p-8 max-w-md mx-auto shadow-sm">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-1">No products match your filters</h3>
            <p className="text-xs text-gray-500 mb-6">Try broadening your price range or search terms.</p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-2xl shadow hover:bg-[#B0583E]"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-serif text-sm text-gray-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
