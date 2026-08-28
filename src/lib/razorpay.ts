import crypto from 'crypto';

interface CreateOrderOptions {
  amountInRupees: number;
  currency?: string;
  receipt?: string;
}

export async function createRazorpayOrder({ amountInRupees, currency = 'INR', receipt }: CreateOrderOptions) {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay API credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing from server environment.');
  }

  // Amount in paise: Math.round(amount * 100). Minimum 100 paise (₹1.00)
  const amountInPaise = Math.max(100, Math.round(amountInRupees * 100));

  const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Razorpay API Order Creation Error:', errorText);
    throw new Error(`Razorpay Order API Failed: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    keyId: razorpayKeyId,
  };
}

export function verifyRazorpaySignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET is not configured on server.');
    return false;
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  // Secure time-constant comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );
  } catch (err) {
    return expectedSignature === razorpay_signature;
  }
}
