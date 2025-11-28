// Local Storage Management Module
// Provides unified storage interface for all app data

import { Task, DailySchedule, ResumeData, WishlistItem, WishlistBudget } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'mlai_tasks',
  SCHEDULES: 'mlai_schedules',
  RESUME: 'mlai_resume',
  WISHLIST: 'mlai_wishlist',
  WISHLIST_BUDGET: 'mlai_wishlist_budget',
  SETTINGS: 'mlai_settings',
} as const;

// Type-safe localStorage wrapper
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

// Task Storage
export const taskStorage = {
  getAll: (): Task[] => getFromStorage(STORAGE_KEYS.TASKS, []),
  
  getById: (id: string): Task | undefined => {
    const tasks = taskStorage.getAll();
    return tasks.find(t => t.id === id);
  },
  
  save: (task: Task): void => {
    const tasks = taskStorage.getAll();
    const index = tasks.findIndex(t => t.id === task.id);
    
    if (index >= 0) {
      tasks[index] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.push(task);
    }
    
    setToStorage(STORAGE_KEYS.TASKS, tasks);
  },
  
  delete: (id: string): void => {
    const tasks = taskStorage.getAll().filter(t => t.id !== id);
    setToStorage(STORAGE_KEYS.TASKS, tasks);
  },
  
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean): void => {
    const tasks = taskStorage.getAll();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex >= 0) {
      const subtaskIndex = tasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex >= 0) {
        tasks[taskIndex].subtasks[subtaskIndex].completed = completed;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        
        // Auto-complete task if all subtasks are done
        const allCompleted = tasks[taskIndex].subtasks.every(st => st.completed);
        if (allCompleted) {
          tasks[taskIndex].status = 'completed';
        }
        
        setToStorage(STORAGE_KEYS.TASKS, tasks);
      }
    }
  },
};

// Schedule Storage
export const scheduleStorage = {
  getByDate: (date: string): DailySchedule | null => {
    const schedules = getFromStorage<DailySchedule[]>(STORAGE_KEYS.SCHEDULES, []);
    return schedules.find(s => s.date === date) || null;
  },
  
  getAll: (): DailySchedule[] => getFromStorage(STORAGE_KEYS.SCHEDULES, []),
  
  save: (schedule: DailySchedule): void => {
    const schedules = scheduleStorage.getAll();
    const index = schedules.findIndex(s => s.date === schedule.date);
    
    if (index >= 0) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    setToStorage(STORAGE_KEYS.SCHEDULES, schedules);
  },
  
  updateBlockCompletion: (date: string, blockId: string, completed: boolean): void => {
    const schedule = scheduleStorage.getByDate(date);
    if (schedule) {
      const blockIndex = schedule.blocks.findIndex(b => b.id === blockId);
      if (blockIndex >= 0) {
        schedule.blocks[blockIndex].completed = completed;
        scheduleStorage.save(schedule);
      }
    }
  },
  
  addFeedback: (date: string, feedback: DailySchedule['feedback']): void => {
    const schedule = scheduleStorage.getByDate(date);
    if (schedule) {
      schedule.feedback = feedback;
      scheduleStorage.save(schedule);
    }
  },
};

// Resume Storage
export const resumeStorage = {
  get: (): ResumeData | null => getFromStorage(STORAGE_KEYS.RESUME, null),
  
  save: (resume: ResumeData): void => {
    setToStorage(STORAGE_KEYS.RESUME, {
      ...resume,
      updatedAt: new Date().toISOString(),
    });
  },
  
  clear: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.RESUME);
    }
  },
};

// Wishlist Storage
export const wishlistStorage = {
  getAll: (): WishlistItem[] => getFromStorage(STORAGE_KEYS.WISHLIST, []),
  
  getById: (id: string): WishlistItem | undefined => {
    const items = wishlistStorage.getAll();
    return items.find(item => item.id === id);
  },
  
  save: (item: WishlistItem): void => {
    const items = wishlistStorage.getAll();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      items.push(item);
    }
    
    setToStorage(STORAGE_KEYS.WISHLIST, items);
  },
  
  delete: (id: string): void => {
    const items = wishlistStorage.getAll().filter(i => i.id !== id);
    setToStorage(STORAGE_KEYS.WISHLIST, items);
  },
  
  updateStatus: (id: string, status: WishlistItem['status']): void => {
    const items = wishlistStorage.getAll();
    const index = items.findIndex(i => i.id === id);
    
    if (index >= 0) {
      items[index].status = status;
      items[index].updatedAt = new Date().toISOString();
      setToStorage(STORAGE_KEYS.WISHLIST, items);
    }
  },
  
  getBudget: (): WishlistBudget => getFromStorage(STORAGE_KEYS.WISHLIST_BUDGET, {
    total: 50000,
    spent: 0,
    remaining: 50000,
  }),
  
  saveBudget: (budget: WishlistBudget): void => {
    setToStorage(STORAGE_KEYS.WISHLIST_BUDGET, budget);
  },
};

// Settings Storage
export interface AppSettings {
  workHoursStart: string;
  workHoursEnd: string;
  breakDuration: number;
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
}

export const settingsStorage = {
  get: (): AppSettings => getFromStorage(STORAGE_KEYS.SETTINGS, {
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    breakDuration: 15,
    theme: 'system',
    language: 'ja',
  }),
  
  save: (settings: AppSettings): void => {
    setToStorage(STORAGE_KEYS.SETTINGS, settings);
  },
};
