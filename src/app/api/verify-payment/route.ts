import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createOrderRecord } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails, is_cod } = body;

    // Handle Cash on Delivery (COD) order
    if (is_cod || orderDetails?.payment_method === 'cod' || razorpay_signature === 'COD_NO_SIG') {
      const savedOrder = await createOrderRecord({
        ...orderDetails,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'received',
      });

      return NextResponse.json({
        success: true,
        message: 'COD order confirmed successfully',
        order: savedOrder,
      });
    }

    // Online Razorpay Payment Signature Verification
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Save order into Database
    let savedOrder = null;
    if (orderDetails) {
      savedOrder = await createOrderRecord({
        ...orderDetails,
        razorpay_order_id,
        razorpay_payment_id,
        payment_status: 'paid',
        payment_method: 'online',
        order_status: 'received',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment signature verified successfully',
      order: savedOrder,
    });
  } catch (error: any) {
    console.error('API /verify-payment Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
