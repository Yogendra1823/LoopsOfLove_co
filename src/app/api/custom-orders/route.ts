import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received Custom Order:', body);
    return NextResponse.json({ success: true, message: 'Custom order request received successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit custom order' }, { status: 500 });
  }
}
