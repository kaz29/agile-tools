import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');

  if (!roomId || !userId) {
    return NextResponse.json(
      { error: 'roomId and userId are required' },
      { status: 400 }
    );
  }

  try {
    // Azure Functionsのnegotiateエンドポイントにプロキシ
    const response = await fetch(
      `http://localhost:7071/negotiate?roomId=${roomId}&userId=${userId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to negotiate: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Negotiate error:', error);
    return NextResponse.json(
      { error: 'Failed to negotiate connection' },
      { status: 500 }
    );
  }
}
