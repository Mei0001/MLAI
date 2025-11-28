import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent } from '@/lib/ai';
import { ResumeGenerateRequest, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ResumeGenerateRequest = await request.json();
    
    if (!body.resumeData) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Resume data is required',
      }, { status: 400 });
    }

    if (!body.targetJob) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Target job is required',
      }, { status: 400 });
    }

    const content = await generateResumeContent(
      body.resumeData,
      body.targetJob,
      body.style || 'professional'
    );

    return NextResponse.json<ApiResponse<{ content: string }>>({
      success: true,
      data: { content },
    });
  } catch (error) {
    console.error('Resume generate error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to generate resume',
    }, { status: 500 });
  }
}
