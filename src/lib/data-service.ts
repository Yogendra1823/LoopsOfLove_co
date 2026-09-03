import { supabase } from '@/lib/supabase';
import { Product, Category, Order, CustomOrder, Coupon, SiteSettings, Review } from '@/types';
import {
  SAMPLE_PRODUCTS,
  SAMPLE_CATEGORIES,
  SAMPLE_COUPONS,
  DEFAULT_SITE_SETTINGS,
  SAMPLE_REVIEWS,
  SAMPLE_ORDERS,
  SAMPLE_CUSTOM_ORDERS,
} from '@/data/sample-data';

// In-Memory Fallback State (Ensures 100% working app even if Supabase table is pending)
let memoryProducts: Product[] = [...SAMPLE_PRODUCTS];
let memoryCategories: Category[] = [...SAMPLE_CATEGORIES];
let memoryOrders: Order[] = [...SAMPLE_ORDERS];
let memoryCustomOrders: CustomOrder[] = [...SAMPLE_CUSTOM_ORDERS];
let memoryCoupons: Coupon[] = [...SAMPLE_COUPONS];
let memorySiteSettings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
let memoryReviews: Review[] = [...SAMPLE_REVIEWS];

// --- PRODUCTS ---
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)');

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (e) {
    console.warn('Supabase products fetch failed, using fallback database store:', e);
  }
  return memoryProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const newId = productData.id || `prod-${Date.now()}`;
  const slug = productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `product-${Date.now()}`);

  const fullProduct: Product = {
    id: newId,
    name: productData.name || 'Untitled Crochet Product',
    slug,
    description: productData.description || '',
    short_description: productData.short_description || '',
    price: Number(productData.price) || 0,
    compare_at_price: productData.compare_at_price ? Number(productData.compare_at_price) : undefined,
    sku: productData.sku || `LOL-${Date.now()}`,
    category_id: productData.category_id || memoryCategories[0]?.id || 'cat-1',
    stock: Number(productData.stock) || 10,
    status: productData.status || 'active',
    is_featured: Boolean(productData.is_featured),
    is_best_seller: Boolean(productData.is_best_seller),
    is_new: Boolean(productData.is_new ?? true),
    is_customizable: Boolean(productData.is_customizable ?? true),
    made_to_order: Boolean(productData.made_to_order ?? false),
    preparation_time: productData.preparation_time || 'Ready to Ship (Dispatched in 24 hrs)',
    materials: productData.materials || '100% Organic Cotton Yarn',
    dimensions: productData.dimensions || 'Standard Size',
    care_instructions: productData.care_instructions || 'Gentle hand wash in cold water.',
    tags: productData.tags || ['crochet', 'handmade'],
    seo_title: productData.seo_title || productData.name,
    seo_description: productData.seo_description || productData.description,
    created_at: productData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: productData.rating || 5.0,
    review_count: productData.review_count || 0,
    images: productData.images && productData.images.length > 0 ? productData.images : [
      {
        id: `img-${Date.now()}`,
        product_id: newId,
        url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
        alt_text: productData.name || 'Crochet item',
        is_primary: true,
        sort_order: 1
      }
    ],
    variants: productData.variants || []
  };

  try {
    await supabase.from('products').upsert({
      id: fullProduct.id,
      name: fullProduct.name,
      slug: fullProduct.slug,
      description: fullProduct.description,
      short_description: fullProduct.short_description,
      price: fullProduct.price,
      compare_at_price: fullProduct.compare_at_price,
      category_id: fullProduct.category_id,
      stock: fullProduct.stock,
      made_to_order: fullProduct.made_to_order,
      preparation_time: fullProduct.preparation_time,
      materials: fullProduct.materials,
      dimensions: fullProduct.dimensions,
      care_instructions: fullProduct.care_instructions,
      featured: fullProduct.is_featured,
      best_seller: fullProduct.is_best_seller,
      status: fullProduct.status
    });
  } catch (e) {
    console.warn('Supabase product upsert failed, updated memory store:', e);
  }

  const existingIdx = memoryProducts.findIndex((p) => p.id === newId);
  if (existingIdx > -1) {
    memoryProducts[existingIdx] = fullProduct;
  } else {
    memoryProducts.unshift(fullProduct);
  }

  return fullProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase product delete failed, updated memory store:', e);
  }
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  return true;
}

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  } catch (e) {
    console.warn('Supabase categories fetch failed:', e);
  }
  return memoryCategories;
}

const ORDERS_STORAGE_KEY = 'loops-of-love-orders';

const ADMIN_EMAILS = ['medarametlayogendra@gmail.com', 'loopsoflove.co3@gmail.com'];

function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalOrder(order: Order) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('order-created'));
  } catch (e) {
    console.warn('Failed to save order to localStorage:', e);
  }
}

// --- ORDERS ---
export async function createOrderRecord(orderData: Partial<Order>): Promise<Order> {
  const newOrder: Order = {
    id: orderData.id || `LOL-ORD-${Date.now()}`,
    order_number: orderData.order_number || `${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: orderData.customer_name || orderData.shipping_address?.full_name || 'Customer',
    customer_email: orderData.customer_email || 'customer@loopsoflove.co',
    customer_phone: orderData.customer_phone || orderData.shipping_address?.phone || '',
    shipping_address: orderData.shipping_address || {
      id: `addr-${Date.now()}`,
      full_name: 'Customer',
      phone: '',
      address_line1: 'India',
      city: 'City',
      state: 'State',
      pincode: '400001',
    },
    subtotal: Number(orderData.subtotal) || 0,
    shipping_fee: Number(orderData.shipping_fee) || 0,
    discount_amount: Number(orderData.discount_amount) || 0,
    total_amount: Number(orderData.total_amount) || 0,
    payment_method: orderData.payment_method || 'online',
    payment_status: orderData.payment_status || 'pending',
    order_status: orderData.order_status || 'received',
    razorpay_order_id: orderData.razorpay_order_id,
    razorpay_payment_id: orderData.razorpay_payment_id,
    gift_note: orderData.gift_note,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: orderData.items || [],
  };

  // 1. Save to local storage for instant browser availability
  saveLocalOrder(newOrder);

  // 2. Try Supabase insert
  try {
    await supabase.from('orders').insert({
      id: newOrder.id,
      total_amount: newOrder.total_amount,
      discount_amount: newOrder.discount_amount,
      shipping_fee: newOrder.shipping_fee,
      payment_method: newOrder.payment_method === 'online' ? 'online' : 'cod',
      payment_status: newOrder.payment_status,
      order_status: newOrder.order_status,
      razorpay_order_id: newOrder.razorpay_order_id,
      razorpay_payment_id: newOrder.razorpay_payment_id,
      gift_note: newOrder.gift_note,
    });
  } catch (e) {
    console.warn('Supabase order insert failed, stored in memory & browser store:', e);
  }

  // 3. Add to in-memory store
  memoryOrders.unshift(newOrder);
  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  const localOrders = getLocalOrders();
  let supabaseOrders: Order[] = [];

  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      supabaseOrders = data as Order[];
    }
  } catch (e) {
    console.warn('Supabase orders fetch failed:', e);
  }

  // Merge: Local Orders (highest priority) -> Supabase Orders -> Memory / Sample Orders
  const mergedMap = new Map<string, Order>();

  // Add sample/memory orders first
  for (const ord of [...SAMPLE_ORDERS, ...memoryOrders]) {
    mergedMap.set(ord.id, ord);
  }

  // Overwrite with supabase orders
  for (const ord of supabaseOrders) {
    mergedMap.set(ord.id, ord);
  }

  // Overwrite with local orders (user-created orders)
  for (const ord of localOrders) {
    mergedMap.set(ord.id, ord);
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getOrdersByCustomerEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  const cleanEmail = email.trim().toLowerCase();
  const allOrders = await getOrders();

  // If the logged in user is an Admin, show all orders
  if (ADMIN_EMAILS.includes(cleanEmail)) {
    return allOrders;
  }

  return allOrders.filter(
    (o) =>
      o.customer_email?.toLowerCase() === cleanEmail ||
      o.shipping_address?.phone === cleanEmail ||
      o.customer_name?.toLowerCase() === cleanEmail
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!id) return null;
  const cleanId = id.trim().toLowerCase();
  const orders = await getOrders();
  return (
    orders.find(
      (o) =>
        o.id.toLowerCase() === cleanId ||
        (o.order_number && o.order_number.toLowerCase() === cleanId) ||
        (o.razorpay_order_id && o.razorpay_order_id.toLowerCase() === cleanId) ||
        (o.id.replace(/[^a-z0-9]/gi, '').toLowerCase() === cleanId.replace(/[^a-z0-9]/gi, ''))
    ) || null
  );
}

export async function updateOrderStatus(orderId: string, status: Order['order_status']): Promise<boolean> {
  try {
    await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
  } catch (e) {
    console.warn('Supabase order update failed:', e);
  }

  // Update memory store
  const order = memoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.order_status = status;
    order.updated_at = new Date().toISOString();
  }

  // Update localStorage
  if (typeof window !== 'undefined') {
    try {
      const local = getLocalOrders();
      const updated = local.map((o) => (o.id === orderId ? { ...o, order_status: status, updated_at: new Date().toISOString() } : o));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('order-created'));
    } catch (e) {
      console.warn('Failed to update order in localStorage:', e);
    }
  }

  return true;
}

// --- CUSTOM ORDERS ---
const CUSTOM_ORDERS_STORAGE_KEY = 'loops-of-love-custom-orders';

function getLocalCustomOrders(): CustomOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function createCustomOrderRecord(customData: Partial<CustomOrder>): Promise<CustomOrder> {
  const record: CustomOrder = {
    id: `co-${Date.now()}`,
    customer_name: customData.customer_name || 'Guest',
    customer_email: customData.customer_email || '',
    customer_phone: customData.customer_phone || '',
    idea_description: customData.idea_description || '',
    target_budget: Number(customData.target_budget) || 1000,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getLocalCustomOrders();
      localStorage.setItem(CUSTOM_ORDERS_STORAGE_KEY, JSON.stringify([record, ...existing]));
      window.dispatchEvent(new Event('custom-order-created'));
    } catch (e) {
      console.warn('Failed to save custom order to localStorage:', e);
    }
  }

  try {
    await supabase.from('custom_orders').insert({
      customer_name: record.customer_name,
      whatsapp_number: record.customer_phone,
      email: record.customer_email,
      category: 'custom',
      budget_range: `₹${record.target_budget}`,
      description: record.idea_description,
      status: 'new',
    });
  } catch (e) {
    console.warn('Supabase custom order insert failed:', e);
  }

  memoryCustomOrders.unshift(record);
  return record;
}

export async function getCustomOrders(): Promise<CustomOrder[]> {
  const localOrders = getLocalCustomOrders();
  let supabaseOrders: CustomOrder[] = [];

  try {
    const { data, error } = await supabase.from('custom_orders').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      supabaseOrders = data as CustomOrder[];
    }
  } catch (e) {
    console.warn('Supabase custom orders fetch failed:', e);
  }

  const merged = new Map<string, CustomOrder>();
  for (const o of memoryCustomOrders) {
    merged.set(o.id, o);
  }
  for (const o of supabaseOrders) {
    merged.set(o.id, o);
  }
  for (const o of localOrders) {
    merged.set(o.id, o);
  }

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// --- COUPONS ---
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase.from('coupons').select('*');
    if (!error && data && data.length > 0) {
      return data as Coupon[];
    }
  } catch (e) {
    console.warn('Supabase coupons fetch failed:', e);
  }
  return memoryCoupons;
}

export async function saveCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
  const newCoupon: Coupon = {
    id: couponData.id || `cpn-${Date.now()}`,
    code: (couponData.code || `PROMO${Math.floor(Math.random() * 1000)}`).toUpperCase().trim(),
    discount_type: couponData.discount_type || 'percentage',
    discount_value: Number(couponData.discount_value) || 10,
    min_order_amount: Number(couponData.min_order_amount) || 0,
    max_discount_amount: couponData.max_discount_amount ? Number(couponData.max_discount_amount) : undefined,
    is_active: couponData.is_active !== undefined ? couponData.is_active : true,
    start_date: couponData.start_date || new Date().toISOString(),
    expiry_date: couponData.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString(),
    usage_limit: couponData.usage_limit || 100,
    used_count: couponData.used_count || 0,
  };

  try {
    await supabase.from('coupons').upsert({
      id: newCoupon.id,
      code: newCoupon.code,
      discount_type: newCoupon.discount_type,
      discount_value: newCoupon.discount_value,
      min_order_amount: newCoupon.min_order_amount,
      max_discount: newCoupon.max_discount_amount,
      is_active: newCoupon.is_active,
      expires_at: newCoupon.expiry_date,
    });
  } catch (e) {
    console.warn('Supabase coupon upsert failed, updated memory store:', e);
  }

  const idx = memoryCoupons.findIndex((c) => c.id === newCoupon.id);
  if (idx > -1) {
    memoryCoupons[idx] = newCoupon;
  } else {
    memoryCoupons.unshift(newCoupon);
  }
  return newCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    await supabase.from('coupons').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase coupon delete failed:', e);
  }
  memoryCoupons = memoryCoupons.filter((c) => c.id !== id);
  return true;
}

// --- SITE SETTINGS ---
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (!error && data) {
      return { ...DEFAULT_SITE_SETTINGS, ...data };
    }
  } catch (e) {
    console.warn('Supabase site settings fetch failed:', e);
  }
  return memorySiteSettings;
}

export async function updateSiteSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  memorySiteSettings = { ...memorySiteSettings, ...newSettings };
  try {
    await supabase.from('site_settings').upsert({
      id: 'default',
      ...memorySiteSettings,
    });
  } catch (e) {
    console.warn('Supabase site settings update failed:', e);
  }
  return memorySiteSettings;
}
