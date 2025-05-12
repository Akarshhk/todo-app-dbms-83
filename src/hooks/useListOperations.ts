
import { TodoAction, TodoList } from "@/contexts/todo/types";
import { listService } from "@/services/listService";
import { useToast } from "@/hooks/use-toast";

export function useListOperations(dispatch: React.Dispatch<TodoAction>) {
  const { toast } = useToast();

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

  return {
    addList,
    editList,
    deleteList
  };
}
