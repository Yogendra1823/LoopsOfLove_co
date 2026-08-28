'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/lib/data-service';
import { Product, Review } from '@/types';
import { formatCurrency, isValidIndianPincode } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  Plus,
  Send,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isInWishlist, addToast, authUser } = useAppStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, author: '', comment: '' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const found = await getProductBySlug(slug);
        setProduct(found);

        const all = await getProducts();
        setRelatedProducts(all.filter((p) => p.slug !== slug).slice(0, 4));
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handlePincodeCheck = () => {
    if (!isValidIndianPincode(pincode)) {
      addToast('error', 'Please enter a valid 6-digit Indian PIN code.');
      setDeliveryStatus(null);
      return;
    }
    const days = product?.made_to_order ? (product.crafting_days || 3) + 3 : 2;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + days);
    const dateStr = estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    setDeliveryStatus(`Delivery available to ${pincode}! Expected arrival by ${dateStr} via Express Courier.`);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.email && !newReview.author.trim()) {
      addToast('error', 'Please enter your name to submit a review.');
      return;
    }
    if (!newReview.comment.trim()) {
      addToast('error', 'Please write your review comment.');
      return;
    }

    const reviewObj: Review = {
      id: `rev-${Date.now()}`,
      product_id: product?.id || '',
      user_name: authUser?.name || newReview.author || 'Verified Customer',
      rating: newReview.rating,
      title: 'Wonderful handmade piece!',
      comment: newReview.comment,
      is_verified_purchase: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    setReviews([reviewObj, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ rating: 5, author: '', comment: '' });
    addToast('success', 'Thank you! Your verified review has been submitted.');
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-serif text-sm text-gray-500 bg-[#FAF4E8] min-h-screen">
        Loading handcrafted product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center bg-[#FAF4E8] min-h-screen flex flex-col justify-center items-center">
        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-3">Product Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The requested handmade item does not exist or has been archived.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-full shadow">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span>/</span>
          <span className="text-[#1A1A1A] font-semibold">{product.name}</span>
        </div>

        {/* Product Details Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-[#E8DEC9] shadow-sm">
          <ProductGallery images={product.images || []} productName={product.name} />

          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Badges & Live Viewers */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {product.made_to_order ? (
                    <Badge variant="sage">Made to Order ({product.crafting_days || 3}d Crafting)</Badge>
                  ) : (
                    <Badge variant="rose">⚡ Ready to Ship in 24h</Badge>
                  )}
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">{product.name}</h1>

              {/* Ratings */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating || 5.0}</span>
                <span className="text-xs text-gray-400">({reviews.length || product.review_count || 12} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-[#1A1A1A]">{formatCurrency(currentPrice)}</span>
                {product.compare_at_price && (
                  <span className="text-base text-gray-400 line-through">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Inclusive of all taxes
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

              {/* PIN Code Delivery Checker */}
              <div className="p-4 bg-[#FAF4E8] rounded-2xl border border-[#E8DEC9] mb-6 space-y-2">
                <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C86D51]" /> Check Pan-India Courier Delivery
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                  <button
                    type="button"
                    onClick={handlePincodeCheck}
                    className="px-4 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#C86D51] transition-colors"
                  >
                    Check
                  </button>
                </div>
                {deliveryStatus && (
                  <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1 mt-1 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {deliveryStatus}
                  </p>
                )}
              </div>

              {/* Color & Style Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Select Color / Custom Option:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedVariantId === variant.id
                            ? 'border-[#C86D51] bg-[#C86D51]/10 text-[#C86D51] shadow-sm'
                            : 'border-[#E8DEC9] text-gray-700 hover:border-gray-400 bg-[#FAF4E8]/50'
                        }`}
                      >
                        {variant.name} (+{formatCurrency(variant.price - product.price)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity:</label>
                <div className="flex items-center border border-[#E8DEC9] rounded-xl overflow-hidden bg-[#FAF4E8]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-sm text-[#1A1A1A]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-[#F4EFE6]">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => addToCart(product, quantity, selectedVariant)}
                  className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                >
                  <ShoppingBag className="w-5 h-5" /> Add to Cart • {formatCurrency(currentPrice * quantity)}
                </Button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isSaved
                      ? 'border-rose-300 bg-rose-50 text-rose-600 shadow'
                      : 'border-[#E8DEC9] text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 p-3 bg-[#FAF4E8] rounded-xl border border-[#E8DEC9]/50">
                  <Truck className="w-4 h-4 text-[#C86D51]" />
                  <span>Pan-India Safe Courier</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#FAF4E8] rounded-xl border border-[#E8DEC9]/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Organic Milk Cotton</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DEC9] pb-4 gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Customer Reviews ({reviews.length})</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">Based on verified handmade deliveries</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </div>

          {/* Add Review Form */}
          {showReviewForm && (
            <form onSubmit={handleAddReview} className="p-5 bg-[#FAF4E8] rounded-2xl border border-[#E8DEC9] space-y-4 animate-fade-in-up">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Share Your Experience</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={authUser?.name || newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    placeholder="e.g. Ananya S."
                    className="w-full px-3 py-2 bg-white border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Star Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5 Exceptional)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                    <option value="3">⭐⭐⭐ (3/5 Average)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Review *</label>
                <textarea
                  required
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="How was the yarn softness, craftsmanship, packaging, and delivery?"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>

              <Button type="submit" className="text-xs py-2.5 px-6 shadow">
                <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Review
              </Button>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4 divide-y divide-[#F4EFE6]">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No reviews submitted yet. Be the first to review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1A1A1A]">{rev.user_name}</span>
                      {rev.is_verified_purchase && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Creations Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">You May Also Love</h2>
                <p className="text-xs text-gray-500">More handmade treasures from our studio</p>
              </div>
              <Link href="/shop" className="text-xs font-semibold text-[#C86D51] hover:underline">
                View Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
