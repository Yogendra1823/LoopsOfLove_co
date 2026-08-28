'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { createOrderRecord } from '@/lib/data-service';
import { formatCurrency, isValidIndianPhone, isValidIndianPincode } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowRight, Lock, User } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getSubtotal, getShippingFee, getTotal, clearCart, addToast, authUser } = useAppStore();

  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const localEmail = localStorage.getItem('user_email') || localStorage.getItem('admin_email');
    return !!(localEmail || authUser?.email);
  });

  const [formData, setFormData] = useState({
    fullName: authUser?.name || '',
    email: authUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'online',
    giftNote: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localEmail = localStorage.getItem('user_email') || localStorage.getItem('admin_email');
      const localName = localStorage.getItem('user_name');
      const authed = !!(localEmail || authUser?.email);
      setIsAuthed(authed);
      if (authed) {
        setFormData((prev) => ({
          ...prev,
          email: prev.email || authUser?.email || localEmail || '',
          fullName: prev.fullName || authUser?.name || localName || '',
        }));
      }
    }
  }, [authUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();

  // Load Razorpay Standard Checkout Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay SDK script');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnlineRazorpayPayment = async () => {
    try {
      // 1. Create Razorpay order on server
      const createRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          customer: formData,
          items: cart,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.orderId) {
        throw new Error(createData.error || 'Failed to create order on payment server.');
      }

      const razorpayKeyId = createData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // Order details for database record upon success
      const orderDetails = {
        subtotal,
        shipping_fee: shipping,
        total_amount: total,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        gift_note: formData.giftNote,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          price: item.selectedVariant ? item.selectedVariant.price : item.product.price,
          quantity: item.quantity,
        })),
      };

      // 2. Configure Razorpay Standard Checkout Options
      const options = {
        key: razorpayKeyId,
        amount: createData.amount,
        currency: createData.currency || 'INR',
        name: 'Loops of Love',
        description: 'Handmade Crochet Creations Order',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',
        order_id: createData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          giftNote: formData.giftNote || 'None',
        },
        theme: {
          color: '#C86D51',
        },
        handler: async function (response: any) {
          setIsSubmitting(true);
          try {
            // Save client-side immediately
            const clientSavedOrder = await createOrderRecord({
              ...orderDetails,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              payment_method: 'online',
              payment_status: 'paid',
              order_status: 'received',
            });

            // Also notify backend verification
            fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails,
              }),
            }).catch((err) => console.warn('Background verify notification:', err));

            addToast('success', 'Payment verified successfully! Order confirmed.');
            clearCart();
            router.push(`/order-confirmation/${clientSavedOrder.id}`);
          } catch (verifyErr) {
            console.error('Payment Verification Error:', verifyErr);
            addToast('error', 'Payment verification failed. Please contact support.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            addToast('info', 'Payment process was cancelled.');
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error('Razorpay payment failed:', response.error);
          addToast('error', `Payment Failed: ${response.error.description || 'Transaction unsuccessful'}`);
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      addToast('error', err.message || 'Payment initialization failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      const orderDetails = {
        subtotal,
        shipping_fee: shipping,
        total_amount: total,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        payment_method: 'cod' as const,
        payment_status: 'pending' as const,
        order_status: 'received' as const,
        gift_note: formData.giftNote,
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          price: item.selectedVariant ? item.selectedVariant.price : item.product.price,
          quantity: item.quantity,
        })),
      };

      const saved = await createOrderRecord(orderDetails);

      // Also notify backend
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_cod: true,
          orderDetails,
        }),
      }).catch((e) => console.warn('Background COD notification:', e));

      addToast('success', 'COD Order placed successfully! Cash upon delivery.');
      clearCart();
      router.push(`/order-confirmation/${saved.id}`);
    } catch (err) {
      addToast('error', 'Failed to place COD order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
      addToast('error', 'Please complete all required shipping fields.');
      return;
    }

    if (!isValidIndianPhone(formData.phone)) {
      addToast('error', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!isValidIndianPincode(formData.pincode)) {
      addToast('error', 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);

    if (formData.paymentMethod === 'online') {
      await handleOnlineRazorpayPayment();
    } else {
      await handleCODOrder();
    }
  };

  if (!isAuthed) {
    return (
      <div className="py-20 bg-[#FAF4E8] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DEC9] shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#C86D51]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Sign In to Complete Order</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              Please sign in or create an account to proceed with secure checkout, payment, and courier delivery.
            </p>
            <Link href="/login?redirect=/checkout" className="block w-full">
              <Button className="w-full py-3.5 text-sm font-semibold shadow-md flex items-center justify-center gap-2">
                <User className="w-4 h-4" /> Sign In / Register to Pay <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-[11px] text-gray-400">
              Your cart items ({cart.length}) will be waiting for you once signed in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center bg-[#FAF4E8] min-h-screen flex flex-col justify-center items-center">
        <p className="font-serif text-lg text-gray-600 mb-4">No items in cart to checkout.</p>
        <Button onClick={() => router.push('/shop')}>Explore Shop</Button>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF4E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Secure Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">Pan-India Courier Delivery & Safe Online Payment</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#E8DEC9] pb-4">
                1. Shipping Address (Pan-India)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number (for Courier Updates) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ananya@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address / House No. / Landmark *</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Flat/House No., Building, Street Name, Landmark"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai / Delhi / Bengaluru"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Personal Gift Note (Optional)</label>
                <textarea
                  name="giftNote"
                  rows={2}
                  value={formData.giftNote}
                  onChange={handleInputChange}
                  placeholder="We will handwrite this gift message on a mini card inside the package!"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF4E8] border border-[#E8DEC9] rounded-xl focus:outline-none focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#E8DEC9] pb-4">
                2. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'online'
                      ? 'border-[#C86D51] bg-[#C86D51]/5'
                      : 'border-[#E8DEC9] hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleInputChange}
                    className="text-[#C86D51] focus:ring-[#C86D51]"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#C86D51]" />
                    <div>
                      <span className="block font-bold text-xs text-[#1A1A1A]">Online Payment (Razorpay)</span>
                      <span className="text-[10px] text-gray-500">UPI, GPay, PhonePe, Cards, NetBanking</span>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#C86D51] bg-[#C86D51]/5'
                      : 'border-[#E8DEC9] hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="text-[#C86D51] focus:ring-[#C86D51]"
                  />
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="block font-bold text-xs text-[#1A1A1A]">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-gray-500">Pay cash upon package arrival</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8DEC9] shadow-sm h-fit space-y-6 sticky top-8">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#E8DEC9] pb-4">
              Order Summary ({cart.length} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedVariant?.id}`} className="flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF4E8] shrink-0 border border-[#E8DEC9]">
                    <Image
                      src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] truncate">{item.product.name}</p>
                    <p className="text-gray-500">
                      Qty: {item.quantity} x {formatCurrency(item.selectedVariant ? item.selectedVariant.price : item.product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-gray-600 pt-4 border-t border-[#E8DEC9]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pan-India Shipping</span>
                <span className="font-semibold text-[#1A1A1A]">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1A1A1A] pt-2 border-t border-[#F4EFE6]">
                <span>Total Amount</span>
                <span className="text-[#C86D51]">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full py-4 text-base font-bold shadow-lg">
              {formData.paymentMethod === 'online' ? `Pay ${formatCurrency(total)} via Razorpay` : `Place COD Order (${formatCurrency(total)})`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Handcrafted Quality Guarantee & Safe Delivery</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
