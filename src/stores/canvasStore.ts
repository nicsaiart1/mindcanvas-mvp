import { create } from 'zustand';
import type { Intention, Task, CanvasState, Position } from '../types/canvas';

interface CanvasStoreState {
  // State
  intentions: Intention[];
  activeIntention: string | null;
  canvasState: CanvasState;
  isCreatingIntention: boolean;
  
  // Actions
  createIntention: (position: Position) => string;
  updateIntention: (id: string, updates: Partial<Intention>) => void;
  deleteIntention: (id: string) => void;
  setActiveIntention: (id: string | null) => void;
  
  addTask: (intentionId: string, task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  resetCanvas: () => void;
  
  // Helpers
  getIntentionById: (id: string) => Intention | undefined;
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByIntentionId: (intentionId: string) => Task[];
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  // Initial state
  intentions: [],
  activeIntention: null,
  canvasState: {
    zoom: 1,
    panX: 0,
    panY: 0,
  },
  isCreatingIntention: false,
  
  // Actions
  createIntention: (position: Position) => {
    const newIntention: Intention = {
      id: crypto.randomUUID(),
      title: '',
      originalVoiceInput: '',
      description: '',
      status: 'listening',
      position,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [],
      attachments: [],
      userContext: [],
      aiProgress: 0,
    };
    
    set((state) => ({
      intentions: [...state.intentions, newIntention],
      activeIntention: newIntention.id,
      isCreatingIntention: true,
    }));
    
    return newIntention.id;
  },
  
  updateIntention: (id: string, updates: Partial<Intention>) => {
    set((state) => ({
      intentions: state.intentions.map((intention) =>
        intention.id === id
          ? { ...intention, ...updates, updatedAt: new Date() }
          : intention
      ),
    }));
  },
  
  deleteIntention: (id: string) => {
    set((state) => ({
      intentions: state.intentions.filter((intention) => intention.id !== id),
      activeIntention: state.activeIntention === id ? null : state.activeIntention,
    }));
  },
  
  setActiveIntention: (id: string | null) => {
    set({ activeIntention: id, isCreatingIntention: false });
  },
  
  addTask: (intentionId: string, taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...taskData,
    };
    
    set((state) => ({
      intentions: state.intentions.map((intention) =>
        intention.id === intentionId
          ? { 
              ...intention, 
              tasks: [...intention.tasks, newTask],
              updatedAt: new Date()
            }
          : intention
      ),
    }));
  },
  
  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      intentions: state.intentions.map((intention) => ({
        ...intention,
        tasks: intention.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
        updatedAt: new Date(),
      })),
    }));
  },
  
  deleteTask: (taskId: string) => {
    set((state) => ({
      intentions: state.intentions.map((intention) => ({
        ...intention,
        tasks: intention.tasks.filter((task) => task.id !== taskId),
        updatedAt: new Date(),
      })),
    }));
  },
  
  updateCanvasState: (updates: Partial<CanvasState>) => {
    set((state) => ({
      canvasState: { ...state.canvasState, ...updates },
    }));
  },
  
  resetCanvas: () => {
    set({
      intentions: [],
      activeIntention: null,
      canvasState: { zoom: 1, panX: 0, panY: 0 },
      isCreatingIntention: false,
    });
  },
  
  // Helpers
  getIntentionById: (id: string) => {
    return get().intentions.find((intention) => intention.id === id);
  },
  
  getTaskById: (taskId: string) => {
    const intentions = get().intentions;
    for (const intention of intentions) {
      const task = intention.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  },
  
  getTasksByIntentionId: (intentionId: string) => {
    const intention = get().getIntentionById(intentionId);
    return intention ? intention.tasks : [];
  },
}));