
import { useEffect } from "react";
import { TodoAction, Todo, TodoState } from "@/contexts/todo/types";
import { todoService } from "@/services/todoService";
import { listService } from "@/services/listService";
import { getTaskStatistics } from "@/contexts/todo/todoReducer";
import { useToast } from "@/hooks/use-toast";

export function useTodoData(dispatch: React.Dispatch<TodoAction>) {
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
  }, [dispatch, toast]);
  
  // Function to calculate task statistics
  const calculateTaskStatistics = (todos: Todo[]) => {
    return getTaskStatistics(todos);
  };
  
  return {
    calculateTaskStatistics
  };
}
