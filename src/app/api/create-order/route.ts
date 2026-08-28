import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, customer, items } = body;

    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { error: 'Invalid order amount. Minimum amount is ₹1 (100 paise).' },
        { status: 400 }
      );
    }

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: numAmount,
      currency: 'INR',
      receipt,
    });

    return NextResponse.json({
      orderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.keyId,
    });
  } catch (error: any) {
    console.error('API /create-order Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
