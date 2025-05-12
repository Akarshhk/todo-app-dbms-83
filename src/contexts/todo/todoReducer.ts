
import { nanoid } from 'nanoid';
import { TodoState, TodoAction, defaultLists } from './types';

// Priority keywords to detect importance
const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'important', 'critical', 'asap', 'emergency', 'deadline'
];

const MEDIUM_PRIORITY_KEYWORDS = [
  'soon', 'needed', 'required', 'upcoming'
];

// Helper function to suggest priority based on text content
export function suggestPriority(text: string): 'low' | 'medium' | 'high' {
  const lowercaseText = text.toLowerCase();
  
  if (HIGH_PRIORITY_KEYWORDS.some(keyword => lowercaseText.includes(keyword))) {
    return 'high';
  }
  
  if (MEDIUM_PRIORITY_KEYWORDS.some(keyword => lowercaseText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

// Reducer function
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload as boolean
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        loadError: action.payload as string
      };
      
    case 'SET_TODOS':
      return {
        ...state,
        todos: Array.isArray(action.payload) ? action.payload : [],
        loadError: null
      };
      
    case 'SET_LISTS':
      return {
        ...state,
        lists: Array.isArray(action.payload) ? action.payload : [...defaultLists],
        loadError: null
      };
      
    case 'ADD_TODO': {
      const payload = action.payload;
      if ('id' in payload) {
        // If payload is already a Todo object
        return {
          ...state,
          todos: [payload, ...state.todos]
        };
      } else {
        // If payload is { text, listId }
        // Auto-suggest priority based on text content
        const text = (payload as { text: string; listId: string }).text;
        const suggestedPriority = suggestPriority(text);
        
        const newTodo = {
          id: nanoid(),
          text: text,
          completed: false,
          listId: (payload as { text: string; listId: string }).listId,
          createdAt: Date.now(),
          priority: suggestedPriority
        };
        return {
          ...state,
          todos: [newTodo, ...state.todos]
        };
      }
    }
      
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        )
      };

    case 'EDIT_TODO': {
      const { id, text } = action.payload as { id: string; text: string };
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, text } : todo
        )
      };
    }
      
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === (action.payload as any).id ? action.payload : todo
        )
      };
      
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
      
    case 'SET_PRIORITY': {
      const { id, priority } = action.payload as { id: string; priority: 'low' | 'medium' | 'high' };
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, priority } : todo
        )
      };
    }
    
    case 'SET_DUE_DATE': {
      const { id, dueDate } = action.payload as { id: string; dueDate: number };
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, dueDate } : todo
        )
      };
    }
      
    case 'ADD_LIST': {
      const payload = action.payload;
      if ('id' in payload) {
        // If payload is already a TodoList
        return {
          ...state,
          lists: [...state.lists, payload]
        };
      } else {
        // If payload is { name, color }
        const newList = {
          id: nanoid(),
          name: (payload as { name: string; color: string }).name,
          color: (payload as { name: string; color: string }).color,
        };
        return {
          ...state,
          lists: [...state.lists, newList]
        };
      }
    }
      
    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === (action.payload as any).id ? action.payload : list
        )
      };
      
    case 'EDIT_LIST': {
      const { id, name, color } = action.payload as { id: string; name: string; color: string };
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === id ? { ...list, name, color } : list
        )
      };
    }
      
    case 'DELETE_LIST': {
      // Don't allow deleting the inbox
      if (action.payload === 'inbox') return state;
      
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        // If active list is deleted, switch to inbox
        activeListId: state.activeListId === action.payload ? 'inbox' : state.activeListId
      };
    }
      
    case 'SET_ACTIVE_LIST':
      return {
        ...state,
        activeListId: action.payload as string | null
      };
      
    default:
      return state;
  }
}

// Function to calculate task statistics
export function getTaskStatistics(todos: Todo[]) {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  
  // Calculate tasks by priority
  const tasksByPriority = {
    high: todos.filter(todo => todo.priority === 'high').length,
    medium: todos.filter(todo => todo.priority === 'medium').length,
    low: todos.filter(todo => todo.priority === 'low' || !todo.priority).length
  };
  
  // Calculate tasks by list
  const tasksByList: Record<string, number> = {};
  todos.forEach(todo => {
    if (!tasksByList[todo.listId]) {
      tasksByList[todo.listId] = 0;
    }
    tasksByList[todo.listId]++;
  });
  
  // Calculate today's completions
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayTimestamp = startOfDay.getTime();
  
  const completedToday = todos.filter(
    todo => todo.completed && todo.createdAt >= startOfDayTimestamp
  ).length;
  
  // Calculate this week's completions
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfWeekTimestamp = startOfWeek.getTime();
  
  const completedThisWeek = todos.filter(
    todo => todo.completed && todo.createdAt >= startOfWeekTimestamp
  ).length;
  
  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    tasksByPriority,
    tasksByList,
    completedToday,
    completedThisWeek
  };
}
