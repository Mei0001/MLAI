// AI Integration Module (OpenAI API Placeholder)
// This module provides AI-powered features using OpenAI API or local fallbacks

import { SubTask, Task, ScheduleBlock, ResumeData } from '@/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Task Decomposition using AI
export async function decomposeTask(taskDescription: string, context?: string): Promise<{
  subtasks: SubTask[];
  estimatedTotalTime: number;
  suggestedPriority: 'high' | 'medium' | 'low';
}> {
  // If OpenAI API is available, use it
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a task management assistant. Decompose tasks into actionable subtasks.
              Return JSON format: { "subtasks": [{"title": "...", "estimatedTime": <minutes>}], "estimatedTotalTime": <minutes>, "suggestedPriority": "high"|"medium"|"low" }`
            },
            {
              role: 'user',
              content: `Task: ${taskDescription}${context ? `\nContext: ${context}` : ''}`
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        subtasks: result.subtasks.map((st: { title: string; estimatedTime?: number }) => ({
          id: generateId(),
          title: st.title,
          completed: false,
          estimatedTime: st.estimatedTime || 15,
        })),
        estimatedTotalTime: result.estimatedTotalTime,
        suggestedPriority: result.suggestedPriority,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fall through to local decomposition
    }
  }

  // Local fallback decomposition (rule-based)
  return localDecomposeTask(taskDescription);
}

// Local task decomposition fallback
function localDecomposeTask(taskDescription: string): {
  subtasks: SubTask[];
  estimatedTotalTime: number;
  suggestedPriority: 'high' | 'medium' | 'low';
} {
  const lowerTask = taskDescription.toLowerCase();
  
  // Keyword-based decomposition patterns
  const patterns: { keywords: string[]; subtasks: string[]; time: number; priority: 'high' | 'medium' | 'low' }[] = [
    {
      keywords: ['プレゼン', 'presentation', 'プレゼンテーション'],
      subtasks: ['テーマと目的を明確化', 'リサーチと情報収集', 'アウトライン作成', 'スライド作成', 'リハーサル'],
      time: 180,
      priority: 'high'
    },
    {
      keywords: ['レポート', 'report', '報告書'],
      subtasks: ['要件確認', 'データ収集', 'アウトライン作成', '本文執筆', 'レビューと修正'],
      time: 120,
      priority: 'medium'
    },
    {
      keywords: ['meeting', '会議', 'ミーティング'],
      subtasks: ['アジェンダ確認', '資料準備', '参加者に連絡', '会議実施', '議事録作成'],
      time: 90,
      priority: 'high'
    },
    {
      keywords: ['勉強', 'study', '学習', 'learn'],
      subtasks: ['学習目標設定', '教材準備', '学習セッション', '復習とノート整理', '進捗確認'],
      time: 120,
      priority: 'medium'
    },
    {
      keywords: ['開発', 'develop', 'コーディング', 'coding', '実装'],
      subtasks: ['要件分析', '設計', '実装', 'テスト', 'コードレビュー'],
      time: 240,
      priority: 'high'
    },
  ];

  // Find matching pattern
  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => lowerTask.includes(kw))) {
      return {
        subtasks: pattern.subtasks.map(title => ({
          id: generateId(),
          title,
          completed: false,
          estimatedTime: Math.round(pattern.time / pattern.subtasks.length),
        })),
        estimatedTotalTime: pattern.time,
        suggestedPriority: pattern.priority,
      };
    }
  }

  // Default decomposition for generic tasks
  const defaultSubtasks = [
    '計画と準備',
    '実行',
    '確認とレビュー',
    '完了報告',
  ];

  return {
    subtasks: defaultSubtasks.map(title => ({
      id: generateId(),
      title,
      completed: false,
      estimatedTime: 15,
    })),
    estimatedTotalTime: 60,
    suggestedPriority: 'medium',
  };
}

// Schedule Optimization
export async function optimizeSchedule(
  tasks: Task[],
  date: string,
  workHoursStart: string = '09:00',
  workHoursEnd: string = '18:00',
  breakDuration: number = 15
): Promise<ScheduleBlock[]> {
  const blocks: ScheduleBlock[] = [];
  
  // Sort tasks by priority and deadline
  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

  // Parse work hours
  const [startHour, startMin] = workHoursStart.split(':').map(Number);
  const [endHour, endMin] = workHoursEnd.split(':').map(Number);
  
  let currentTime = new Date(`${date}T${workHoursStart}:00`);
  const workEnd = new Date(`${date}T${workHoursEnd}:00`);

  // Assign tasks to time blocks
  for (const task of sortedTasks) {
    if (currentTime >= workEnd) break;

    const taskDuration = task.estimatedTime || 60;
    const taskEnd = new Date(currentTime.getTime() + taskDuration * 60000);

    // Check if task fits before work end
    if (taskEnd <= workEnd) {
      blocks.push({
        id: generateId(),
        taskId: task.id,
        title: task.title,
        startTime: currentTime.toISOString(),
        endTime: taskEnd.toISOString(),
        type: 'task',
        completed: false,
      });

      // Add break after task if not at the end
      currentTime = taskEnd;
      if (currentTime < workEnd && breakDuration > 0) {
        const breakEnd = new Date(currentTime.getTime() + breakDuration * 60000);
        if (breakEnd <= workEnd) {
          blocks.push({
            id: generateId(),
            title: '休憩',
            startTime: currentTime.toISOString(),
            endTime: breakEnd.toISOString(),
            type: 'break',
            completed: false,
          });
          currentTime = breakEnd;
        }
      }
    }
  }

  return blocks;
}

// Resume Content Generation
export async function generateResumeContent(
  resumeData: ResumeData,
  targetJob: string,
  style: 'professional' | 'creative' | 'technical' = 'professional'
): Promise<string> {
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional resume writer. Generate tailored resume content.
              Style: ${style}
              Focus on relevant experience and skills for the target job.`
            },
            {
              role: 'user',
              content: `Generate resume content for: ${targetJob}\n\nResume Data:\n${JSON.stringify(resumeData, null, 2)}`
            }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // Local fallback
  return generateLocalResumeContent(resumeData, targetJob, style);
}

function generateLocalResumeContent(
  resumeData: ResumeData,
  targetJob: string,
  style: string
): string {
  const { personalInfo, summary, experience, education, skills } = resumeData;
  
  let content = `# ${personalInfo.name}\n\n`;
  content += `${personalInfo.email}`;
  if (personalInfo.phone) content += ` | ${personalInfo.phone}`;
  if (personalInfo.location) content += ` | ${personalInfo.location}`;
  content += '\n\n';

  content += `## 概要\n${summary || `${targetJob}のポジションに強い関心を持つプロフェッショナルです。`}\n\n`;

  if (experience.length > 0) {
    content += `## 職歴\n`;
    for (const exp of experience) {
      content += `### ${exp.position} @ ${exp.company}\n`;
      content += `${exp.startDate} - ${exp.current ? '現在' : exp.endDate}\n\n`;
      content += `${exp.description}\n`;
      if (exp.achievements.length > 0) {
        content += `\n**主な実績:**\n`;
        exp.achievements.forEach(a => content += `- ${a}\n`);
      }
      content += '\n';
    }
  }

  if (education.length > 0) {
    content += `## 学歴\n`;
    for (const edu of education) {
      content += `### ${edu.degree} - ${edu.field}\n`;
      content += `${edu.institution} (${edu.startDate} - ${edu.endDate || '現在'})\n\n`;
    }
  }

  if (skills.length > 0) {
    content += `## スキル\n`;
    content += skills.join(', ') + '\n';
  }

  return content;
}

// Wishlist Priority Calculation
export function calculateWishlistPriority(
  enthusiasm: number,
  price: number,
  budget: number
): number {
  // Normalize values
  const normalizedEnthusiasm = enthusiasm / 10; // 0-1
  const affordabilityRatio = Math.min(1, budget / price); // 0-1 (1 if affordable)
  
  // Priority formula: weighted combination
  // Higher enthusiasm + more affordable = higher priority
  const priority = (normalizedEnthusiasm * 0.6 + affordabilityRatio * 0.4) * 100;
  
  return Math.round(priority);
}
