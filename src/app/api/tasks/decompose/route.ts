import { NextRequest, NextResponse } from 'next/server';
import { decomposeTask } from '@/lib/ai';
import { TaskDecomposeRequest, TaskDecomposeResponse, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: TaskDecomposeRequest = await request.json();
    
    if (!body.task || body.task.trim() === '') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Task description is required',
      }, { status: 400 });
    }

    const result = await decomposeTask(body.task, body.context);
    
    const response: TaskDecomposeResponse = {
      originalTask: body.task,
      subtasks: result.subtasks,
      estimatedTotalTime: result.estimatedTotalTime,
      suggestedPriority: result.suggestedPriority,
    };

    return NextResponse.json<ApiResponse<TaskDecomposeResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Task decompose error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to decompose task',
    }, { status: 500 });
  }
}
