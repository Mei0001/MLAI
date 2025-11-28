import { NextRequest, NextResponse } from 'next/server';
import { optimizeSchedule } from '@/lib/ai';
import { ScheduleOptimizeRequest, ScheduleBlock, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ScheduleOptimizeRequest = await request.json();
    
    if (!body.tasks || body.tasks.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Tasks are required',
      }, { status: 400 });
    }

    if (!body.date) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Date is required',
      }, { status: 400 });
    }

    const blocks = await optimizeSchedule(
      body.tasks,
      body.date,
      body.workHoursStart,
      body.workHoursEnd,
      body.breakDuration
    );

    return NextResponse.json<ApiResponse<ScheduleBlock[]>>({
      success: true,
      data: blocks,
    });
  } catch (error) {
    console.error('Schedule optimize error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to optimize schedule',
    }, { status: 500 });
  }
}
