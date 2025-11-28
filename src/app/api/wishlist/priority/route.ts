import { NextRequest, NextResponse } from 'next/server';
import { calculateWishlistPriority } from '@/lib/ai';
import { ApiResponse, WishlistItem } from '@/types';

interface PriorityRequest {
  items: WishlistItem[];
  budget: number;
}

interface PrioritizedItem extends WishlistItem {
  priorityScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PriorityRequest = await request.json();
    
    if (!body.items || body.items.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Items are required',
      }, { status: 400 });
    }

    if (body.budget === undefined || body.budget < 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Valid budget is required',
      }, { status: 400 });
    }

    // Calculate priority for each item
    const prioritizedItems: PrioritizedItem[] = body.items
      .filter(item => item.status === 'wanted')
      .map(item => ({
        ...item,
        priorityScore: calculateWishlistPriority(item.enthusiasm, item.price, body.budget),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return NextResponse.json<ApiResponse<PrioritizedItem[]>>({
      success: true,
      data: prioritizedItems,
    });
  } catch (error) {
    console.error('Wishlist priority error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to calculate priorities',
    }, { status: 500 });
  }
}
