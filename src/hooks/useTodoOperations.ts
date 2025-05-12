
import { useState } from "react";
import { TodoAction, Todo } from "@/contexts/todo/types";
import { todoService } from "@/services/todoService";
import { useToast } from "@/hooks/use-toast";
import { suggestPriority } from "@/contexts/todo/todoReducer";

export function useTodoOperations(dispatch: React.Dispatch<TodoAction>) {
  const { toast } = useToast();

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
      const newTodo = await todoService.createTodo({ text, listId, priority: suggestedPriority });
      
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

  return {
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    setPriority,
    setDueDate,
  };
}
