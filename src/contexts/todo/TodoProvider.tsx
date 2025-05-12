
import { useReducer, ReactNode } from "react";
import TodoContext from "./TodoContext";
import { todoReducer, suggestPriority } from "./todoReducer";
import { initialState } from "./types";
import { useTodoOperations } from "@/hooks/useTodoOperations";
import { useListOperations } from "@/hooks/useListOperations";
import { useTodoData } from "@/hooks/useTodoData";

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  
  // Extract functionality to custom hooks
  const { calculateTaskStatistics } = useTodoData(dispatch);
  const { 
    addTodo, 
    toggleTodo, 
    editTodo, 
    deleteTodo, 
    setPriority,
    setDueDate 
  } = useTodoOperations(dispatch);
  
  const { 
    addList, 
    editList, 
    deleteList 
  } = useListOperations(dispatch);
  
  // Function to calculate task statistics for the current state
  const getTaskStatistics = () => {
    return calculateTaskStatistics(state.todos);
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
        getTaskStatistics,
        suggestPriority
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}
