
import { useEffect, useReducer, ReactNode } from "react";
import { TodoContext } from "./TodoContext";
import { todoReducer, suggestPriority, getTaskStatistics } from "./todoReducer";
import { initialState, TaskStatistics } from "./types";
import { todoService } from "@/services/todoService";
import { listService } from "@/services/listService";
import { useToast } from "@/hooks/use-toast";

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { toast } = useToast();
  
  // Fetch todos and lists when component mounts
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Fetch lists first
        const lists = await listService.getAllLists();
        dispatch({ type: 'SET_LISTS', payload: lists });
        
        // Then fetch todos
        const todos = await todoService.getAllTodos();
        dispatch({ type: 'SET_TODOS', payload: todos });
        
      } catch (error) {
        console.error('Error fetching data:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Failed to load data' 
        });
        
        toast({
          title: "Error loading data",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive",
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Function to add a new todo
  const addTodo = async (text: string, listId: string) => {
    try {
      const suggestedPriority = suggestPriority(text);
      
      // First, add to local state for immediate feedback
      dispatch({ 
        type: 'ADD_TODO', 
        payload: { 
          text, 
          listId,
          priority: suggestedPriority
        }
      });
      
      // Then, save to API
      const newTodo = await todoService.createTodo({ text, listId });
      
      // Update with the actual todo from API
      dispatch({ type: 'UPDATE_TODO', payload: newTodo });
    } catch (error) {
      console.error('Error adding todo:', error);
      
      toast({
        title: "Error adding task",
        description: error instanceof Error ? error.message : "Failed to add task",
        variant: "destructive",
      });
    }
  };
  
  // Function to toggle a todo's completion status
  const toggleTodo = async (id: string) => {
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'TOGGLE_TODO', payload: id });
      
      // Then, update in API
      const updatedTodo = await todoService.toggleTodo(id);
      
      // Make sure the UI reflects the actual state from API
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    } catch (error) {
      console.error('Error toggling todo:', error);
      
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
      
      // Revert the local change if API call fails
      dispatch({ type: 'TOGGLE_TODO', payload: id });
    }
  };
  
  // Function to edit a todo's text
  const editTodo = async (id: string, text: string) => {
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'EDIT_TODO', payload: { id, text } });
      
      // Suggest priority based on new text
      const suggestedPriority = suggestPriority(text);
      
      // Then, update in API
      const updatedTodo = await todoService.updateTodo(id, { 
        text,
        priority: suggestedPriority
      });
      
      // Make sure the UI reflects the actual state from API
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    } catch (error) {
      console.error('Error editing todo:', error);
      
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };
  
  // Function to delete a todo
  const deleteTodo = async (id: string) => {
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'DELETE_TODO', payload: id });
      
      // Then, delete in API
      await todoService.deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      
      toast({
        title: "Error deleting task",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
      
      // We'd need to refetch todos if delete fails to restore accurate state
      try {
        const todos = await todoService.getAllTodos();
        dispatch({ type: 'SET_TODOS', payload: todos });
      } catch (fetchError) {
        console.error('Error refetching todos:', fetchError);
      }
    }
  };
  
  // Function to add a new list
  const addList = async (name: string, color: string) => {
    try {
      // Then, save to API
      const newList = await listService.createList({ name, color });
      
      // Update state with the list from API
      dispatch({ type: 'ADD_LIST', payload: newList });
      
      toast({
        title: "List created",
        description: `"${name}" list has been created`,
      });
    } catch (error) {
      console.error('Error adding list:', error);
      
      toast({
        title: "Error creating list",
        description: error instanceof Error ? error.message : "Failed to create list",
        variant: "destructive",
      });
    }
  };
  
  // Function to edit a list
  const editList = async (id: string, name: string, color: string) => {
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'EDIT_LIST', payload: { id, name, color } });
      
      // Then, update in API
      const updatedList = await listService.updateList(id, { name, color });
      
      // Make sure the UI reflects the actual state from API
      dispatch({ type: 'UPDATE_LIST', payload: updatedList });
      
      toast({
        title: "List updated",
        description: `"${name}" list has been updated`,
      });
    } catch (error) {
      console.error('Error editing list:', error);
      
      toast({
        title: "Error updating list",
        description: error instanceof Error ? error.message : "Failed to update list",
        variant: "destructive",
      });
      
      // We'd need to refetch lists if update fails to restore accurate state
      try {
        const lists = await listService.getAllLists();
        dispatch({ type: 'SET_LISTS', payload: lists });
      } catch (fetchError) {
        console.error('Error refetching lists:', fetchError);
      }
    }
  };
  
  // Function to delete a list
  const deleteList = async (id: string) => {
    // Don't allow deleting the inbox
    if (id === 'inbox') {
      toast({
        title: "Cannot delete Inbox",
        description: "The Inbox list cannot be deleted",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'DELETE_LIST', payload: id });
      
      // Then, delete in API
      await listService.deleteList(id);
      
      toast({
        title: "List deleted",
        description: "List has been deleted",
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      
      toast({
        title: "Error deleting list",
        description: error instanceof Error ? error.message : "Failed to delete list",
        variant: "destructive",
      });
      
      // We'd need to refetch lists if delete fails to restore accurate state
      try {
        const lists = await listService.getAllLists();
        dispatch({ type: 'SET_LISTS', payload: lists });
      } catch (fetchError) {
        console.error('Error refetching lists:', fetchError);
      }
    }
  };
  
  // Function to set priority for a task
  const setPriority = async (id: string, priority: 'low' | 'medium' | 'high') => {
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'SET_PRIORITY', payload: { id, priority } });
      
      // Then, update in API
      const updatedTodo = await todoService.updateTodo(id, { priority });
      
      // Make sure the UI reflects the actual state from API
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    } catch (error) {
      console.error('Error setting priority:', error);
      
      toast({
        title: "Error updating priority",
        description: error instanceof Error ? error.message : "Failed to update priority",
        variant: "destructive",
      });
    }
  };
  
  // Function to set due date for a task
  const setDueDate = async (id: string, dueDate: number) => {
    try {
      // First, update local state for immediate feedback
      dispatch({ type: 'SET_DUE_DATE', payload: { id, dueDate } });
      
      // Then, update in API
      const updatedTodo = await todoService.updateTodo(id, { dueDate });
      
      // Make sure the UI reflects the actual state from API
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    } catch (error) {
      console.error('Error setting due date:', error);
      
      toast({
        title: "Error updating due date",
        description: error instanceof Error ? error.message : "Failed to update due date",
        variant: "destructive",
      });
    }
  };
  
  // Function to calculate task statistics
  const calculateTaskStatistics = (): TaskStatistics => {
    return getTaskStatistics(state.todos);
  };
  
  return (
    <TodoContext.Provider 
      value={{
        state,
        dispatch,
        addTodo,
        toggleTodo,
        editTodo,
        deleteTodo,
        addList,
        editList,
        deleteList,
        setPriority,
        setDueDate,
        getTaskStatistics: calculateTaskStatistics,
        suggestPriority
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}
