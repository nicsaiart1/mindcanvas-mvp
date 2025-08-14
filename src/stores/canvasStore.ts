import { create } from 'zustand';
import type { Intention, Task, CanvasState, Position } from '../types/canvas';

interface CanvasStoreState {
  // State
  intentions: Intention[];
  activeIntention: string | null;
  selectedElements: { type: 'intention' | 'task'; id: string }[];
  canvasState: CanvasState;
  isCreatingIntention: boolean;
  
  // Actions
  createIntention: (position: Position) => string;
  updateIntention: (id: string, updates: Partial<Intention>) => void;
  deleteIntention: (id: string) => void;
  cancelActiveIntention: () => void;
  setActiveIntention: (id: string | null) => void;
  
  addTask: (intentionId: string, task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  
  // Selection management
  selectElement: (type: 'intention' | 'task', id: string, multiSelect?: boolean) => void;
  deselectElement: (type: 'intention' | 'task', id: string) => void;
  clearSelection: () => void;
  deleteSelectedElements: () => void;
  
  updateCanvasState: (updates: Partial<CanvasState>) => void;
  resetCanvas: () => void;
  
  // Helpers
  getIntentionById: (id: string) => Intention | undefined;
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByIntentionId: (intentionId: string) => Task[];
  isElementSelected: (type: 'intention' | 'task', id: string) => boolean;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  // Initial state
  intentions: [],
  activeIntention: null,
  selectedElements: [],
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
      collatedOutput: '',
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

  cancelActiveIntention: () => {
    set((state) => {
      const activeId = state.activeIntention;
      if (!activeId) return state;

      const activeIntention = state.intentions.find(i => i.id === activeId);
      
      // If the intention is still in listening state (empty/not started), delete it
      // Otherwise, just deactivate it
      if (activeIntention && activeIntention.status === 'listening' && !activeIntention.title.trim()) {
        return {
          intentions: state.intentions.filter(intention => intention.id !== activeId),
          activeIntention: null,
          isCreatingIntention: false,
        };
      } else {
        return {
          activeIntention: null,
          isCreatingIntention: false,
        };
      }
    });
  },
  
  addTask: (intentionId: string, taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...taskData,
      // Ensure these properties have defaults if not provided
      progress: taskData.progress ?? 0,
      currentStep: taskData.currentStep ?? '',
      outputs: taskData.outputs ?? [],
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
  
  // Selection management
  selectElement: (type: 'intention' | 'task', id: string, multiSelect = false) => {
    set((state) => {
      if (!multiSelect) {
        // Single select - replace selection
        return { selectedElements: [{ type, id }] };
      } else {
        // Multi-select - add to selection if not already selected
        const isAlreadySelected = state.selectedElements.some(
          el => el.type === type && el.id === id
        );
        
        if (isAlreadySelected) {
          return state; // No change if already selected
        }
        
        return {
          selectedElements: [...state.selectedElements, { type, id }]
        };
      }
    });
  },

  deselectElement: (type: 'intention' | 'task', id: string) => {
    set((state) => ({
      selectedElements: state.selectedElements.filter(
        el => !(el.type === type && el.id === id)
      )
    }));
  },

  clearSelection: () => {
    set({ selectedElements: [] });
  },

  deleteSelectedElements: () => {
    const { selectedElements } = get();
    
    console.log('DEL key pressed - deleting selected elements:', selectedElements);
    
    // Group elements by type for efficient deletion
    const intentionIds = selectedElements
      .filter(el => el.type === 'intention')
      .map(el => el.id);
    
    const taskIds = selectedElements
      .filter(el => el.type === 'task')  
      .map(el => el.id);

    set((state) => {
      let newState = { ...state };
      
      // Delete selected intentions
      if (intentionIds.length > 0) {
        newState.intentions = state.intentions.filter(
          intention => !intentionIds.includes(intention.id)
        );
        
        // Clear active intention if it was deleted
        if (state.activeIntention && intentionIds.includes(state.activeIntention)) {
          newState.activeIntention = null;
        }
      }
      
      // Delete selected tasks
      if (taskIds.length > 0) {
        newState.intentions = newState.intentions.map(intention => ({
          ...intention,
          tasks: intention.tasks.filter(task => !taskIds.includes(task.id)),
          updatedAt: new Date()
        }));
      }
      
      // Clear selection after deletion
      newState.selectedElements = [];
      
      return newState;
    });
  },

  resetCanvas: () => {
    set({
      intentions: [],
      activeIntention: null,
      selectedElements: [],
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

  isElementSelected: (type: 'intention' | 'task', id: string) => {
    return get().selectedElements.some(el => el.type === type && el.id === id);
  },
}));