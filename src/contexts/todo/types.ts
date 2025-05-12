
import { Dispatch } from 'react';

// Define types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  listId: string;
  createdAt: number;
  priority?: 'low' | 'medium' | 'high'; // Add priority field
  dueDate?: number; // Add due date for prioritization
}

export interface TodoList {
  id: string;
  name: string;
  color: string;
}

export interface TodoState {
  todos: Todo[];
  lists: TodoList[];
  activeListId: string | null;
  isLoading: boolean;
  loadError: string | null;
}

export type TodoActionPayload = 
  | Todo 
  | Todo[] 
  | TodoList 
  | TodoList[] 
  | string 
  | boolean 
  | { id: string; text: string } 
  | { text: string; listId: string }
  | { id: string; name: string; color: string }
  | { id: string; priority: 'low' | 'medium' | 'high' }
  | { id: string; dueDate: number };

export type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo | { text: string; listId: string } }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'EDIT_TODO'; payload: { id: string; text: string } }
  | { type: 'SET_PRIORITY'; payload: { id: string; priority: 'low' | 'medium' | 'high' } }
  | { type: 'SET_DUE_DATE'; payload: { id: string; dueDate: number } }
  | { type: 'ADD_LIST'; payload: TodoList | { name: string; color: string } }
  | { type: 'SET_LISTS'; payload: TodoList[] }
  | { type: 'UPDATE_LIST'; payload: TodoList }
  | { type: 'EDIT_LIST'; payload: { id: string; name: string; color: string } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_ACTIVE_LIST'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

export interface TodoContextType {
  state: TodoState;
  dispatch: Dispatch<TodoAction>;
  addTodo: (text: string, listId: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  editTodo: (id: string, text: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  addList: (name: string, color: string) => Promise<void>;
  editList: (id: string, name: string, color: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  setPriority: (id: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  setDueDate: (id: string, dueDate: number) => Promise<void>;
  getTaskStatistics: () => TaskStatistics;
  suggestPriority: (text: string) => 'low' | 'medium' | 'high';
}

// New type for task statistics
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByList: Record<string, number>;
  completedToday: number;
  completedThisWeek: number;
}

// Default lists
export const defaultLists: TodoList[] = [
  { id: 'inbox', name: 'Inbox', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#8b5cf6' },
  { id: 'work', name: 'Work', color: '#10b981' }
];

// Initial state
export const initialState: TodoState = {
  todos: [],
  lists: defaultLists,
  activeListId: 'inbox',
  isLoading: false,
  loadError: null,
};
