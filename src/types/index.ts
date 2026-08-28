export type Role = 'customer' | 'admin';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_featured: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options?: Record<string, string>;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  category_id: string;
  category_name?: string;
  crafting_days?: number;
  featured?: boolean;
  stock: number;
  status: ProductStatus;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_customizable: boolean;
  made_to_order: boolean;
  preparation_time?: string;
  materials?: string;
  dimensions?: string;
  care_instructions?: string;
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  images: ProductImage[];
  variants?: ProductVariant[];
  rating: number;
  review_count: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  customization_notes?: string;
}

export interface WishlistItem {
  product_id: string;
  product: Product;
  added_at: string;
}

export interface Address {
  id?: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export type OrderStatus =
  | 'received'
  | 'crafting'
  | 'dispatched'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_to_ship'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'online' | 'razorpay' | 'cod';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  customization_details?: string;
  product_image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  gift_note?: string;
  tracking_number?: string;
  courier_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
}

export type CustomOrderStatus = 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'declined' | 'completed';

export interface CustomOrder {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  idea_description: string;
  preferred_colors?: string;
  preferred_size?: string;
  target_budget?: number;
  deadline_date?: string;
  reference_image_urls?: string[];
  status: CustomOrderStatus;
  admin_notes?: string;
  created_at: string;
}

export interface SiteSettings {
  brand_name: string;
  instagram_handle: string;
  whatsapp_number: string;
  contact_email: string;
  cod_enabled: boolean;
  flat_shipping_fee: number;
  free_shipping_threshold: number;
  announcement_text: string;
}
