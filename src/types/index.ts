// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  subtasks: SubTask[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: number; // minutes
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: number; // minutes
}

// Schedule Types
export interface ScheduleBlock {
  id: string;
  taskId?: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'break' | 'meeting' | 'personal';
  completed: boolean;
}

export interface DailySchedule {
  date: string;
  blocks: ScheduleBlock[];
  feedback?: ScheduleFeedback;
}

export interface ScheduleFeedback {
  rating: number; // 1-5
  completedTasks: number;
  totalTasks: number;
  notes?: string;
}

// Resume Types
export interface ResumeData {
  id: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  targetJob?: string;
  generatedContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  enthusiasm: number; // 1-10
  category: string;
  url?: string;
  imageUrl?: string;
  priorityScore?: number; // calculated based on enthusiasm and budget
  status: 'wanted' | 'purchased' | 'removed';
  createdAt: string;
  updatedAt: string;
}

export interface WishlistBudget {
  total: number;
  spent: number;
  remaining: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TaskDecomposeRequest {
  task: string;
  context?: string;
}

export interface TaskDecomposeResponse {
  originalTask: string;
  subtasks: SubTask[];
  estimatedTotalTime: number;
  suggestedPriority: 'high' | 'medium' | 'low';
}

export interface ScheduleOptimizeRequest {
  tasks: Task[];
  date: string;
  workHoursStart?: string;
  workHoursEnd?: string;
  breakDuration?: number;
}

export interface ResumeGenerateRequest {
  resumeData: ResumeData;
  targetJob: string;
  style?: 'professional' | 'creative' | 'technical';
}
