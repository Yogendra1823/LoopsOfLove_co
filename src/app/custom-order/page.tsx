'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { createCustomOrderRecord } from '@/lib/data-service';
import { Button } from '@/components/ui/Button';
import { Sparkles, Send, CheckCircle2, Lock, User, ArrowRight, UploadCloud, Link as LinkIcon, Trash2, Check } from 'lucide-react';

export default function CustomOrderPage() {
  const router = useRouter();
  const { addToast, authUser } = useAppStore();

  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const sessionEmail = sessionStorage.getItem('user_email') || sessionStorage.getItem('admin_email');
    return !!(sessionEmail || authUser?.email);
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    phone: '',
    email: authUser?.email || '',
    category: 'Bouquet',
    budget: '1000-2000',
    description: '',
    referenceUrl: '',
    referenceImage: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionEmail = sessionStorage.getItem('user_email') || sessionStorage.getItem('admin_email');
      const sessionName = sessionStorage.getItem('user_name');
      const authed = !!(sessionEmail || authUser?.email);
      setIsAuthed(authed);

      if (authed) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || authUser?.name || sessionName || '',
          email: prev.email || authUser?.email || sessionEmail || '',
        }));
      }
    }
  }, [authUser]);

  const handleFileChange = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          referenceImage: dataUrl,
        }));
        addToast('success', 'Reference photo attached!');
      }
    };
    reader.onerror = () => {
      addToast('error', 'Failed to read file.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthed) {
      addToast('error', 'Please sign in to submit a custom creation request.');
      router.push('/login?redirect=/custom-order');
      return;
    }

    if (!formData.name || !formData.phone || !formData.description) {
      addToast('error', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const referenceData = formData.referenceUrl || (formData.referenceImage ? '[Attached Photo Uploaded]' : '');
      await createCustomOrderRecord({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        idea_description: `[Category: ${formData.category}] ${formData.description}${
          referenceData ? ` (Reference: ${referenceData})` : ''
        }`,
        target_budget: Number(formData.budget.split('-')[0]) || 1000,
      });

      addToast('success', 'Custom creation request submitted! We will contact you on WhatsApp.');
      setSubmitted(true);
    } catch (err) {
      addToast('error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Made-to-Order Studio
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">Request a Custom Crochet Piece</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Have a specific flower bouquet color scheme, personalized plushie design, or couple gift idea in mind? Share your dream creation with us!
          </p>
        </div>

        {/* Authentication Gate for Guests */}
        {!isAuthed ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DEC9] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FAF4E8] border border-[#E8DEC9] text-[#C86D51] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Sign In to Request Custom Pieces</h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Please sign in or create an account to submit personalized design inquiries and receive direct artisan crafting quotes.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login?redirect=/custom-order"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C86D51] text-white text-xs font-bold rounded-2xl hover:bg-[#B0583E] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Sign In / Register <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-white p-10 rounded-3xl border border-[#E8DEC9] shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Request Received!</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Thank you <strong>{formData.name}</strong>! Our master artisan will review your custom request and reach out on WhatsApp at <strong>{formData.phone}</strong> within 24 hours.
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Browse Ready Creations <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit WhatsApp number"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Creation Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                >
                  <option value="Bouquet">Custom Flower Bouquet</option>
                  <option value="Keychain">Custom Keychain / Charm</option>
                  <option value="Plushie">Custom Amigurumi Toy</option>
                  <option value="Decor">Custom Home Decor / Wall Hanging</option>
                  <option value="Personalized">Couple / Anniversary Gift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Budget Range (₹)</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                >
                  <option value="500-1000">₹500 - ₹1,000</option>
                  <option value="1000-2000">₹1,000 - ₹2,000</option>
                  <option value="2000-3500">₹2,000 - ₹3,500</option>
                  <option value="3500+">₹3,500+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Creation Details & Requirements *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe colors, specific flowers (e.g. 3 sunflowers + 2 roses), plushie character, or text customization..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
              />
            </div>

            {/* Reference Image / File Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">Reference Photo / Design Link (Optional)</label>
                <div className="flex items-center gap-1 bg-[#FAF4E8] p-1 rounded-xl border border-[#E8DEC9] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      imageMode === 'upload' ? 'bg-[#C86D51] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      imageMode === 'url' ? 'bg-[#C86D51] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Web Link
                  </button>
                </div>
              </div>

              {imageMode === 'upload' ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging ? 'border-[#C86D51] bg-[#C86D51]/10' : 'border-[#E8DEC9] bg-[#FAF4E8]/50 hover:bg-[#FAF4E8]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className="w-6 h-6 text-[#C86D51] mx-auto mb-1" />
                  <p className="font-semibold text-gray-800 text-xs">Choose photo from phone / computer or drag & drop</p>
                  <p className="text-[10px] text-gray-500">Supports PNG, JPG, WebP (Max 5MB)</p>
                </div>
              ) : (
                <input
                  type="url"
                  value={formData.referenceUrl}
                  onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
                  placeholder="https://pinterest.com/... or https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              )}

              {formData.referenceImage && (
                <div className="flex items-center gap-3 p-3 bg-[#FAF4E8] rounded-2xl border border-[#E8DEC9]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E8DEC9] overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.referenceImage} alt="Reference Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-xs">Reference Photo Attached</p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                      <Check className="w-3 h-3" /> Ready to submit with your request
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, referenceImage: '' })}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Submit Custom Request
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
