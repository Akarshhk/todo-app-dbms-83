
import { useState } from "react";
import { Todo, useTodo } from "@/contexts/TodoContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash, X, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TodoItemPriority } from "./TodoItemPriority";
import { TodoDueDate } from "./TodoDueDate";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { dispatch } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showOptions, setShowOptions] = useState(false);
  
  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TODO', payload: todo.id });
  };
  
  const handleDelete = () => {
    dispatch({ type: 'DELETE_TODO', payload: todo.id });
  };
  
  const handleEdit = () => {
    if (editText.trim() !== '') {
      dispatch({
        type: 'EDIT_TODO',
        payload: { id: todo.id, text: editText.trim() }
      });
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  // Format due date for display
  const formatDueDate = (timestamp?: number) => {
    if (!timestamp) return null;
    
    const today = new Date();
    const dueDate = new Date(timestamp);
    
    // Reset time portion for comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return <span className="text-warning font-medium">Due today</span>;
    } else if (diffDays < 0) {
      return <span className="text-destructive font-medium">Overdue</span>;
    } else if (diffDays === 1) {
      return <span className="text-warning">Due tomorrow</span>;
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return <span>Due {dueDate.toLocaleDateString(undefined, options)}</span>;
    }
  };
  
  const dueDateLabel = formatDueDate(todo.dueDate);

  return (
    <div 
      className={cn(
        "group flex flex-col gap-1 p-3 border rounded-lg transition-all duration-200 stagger-item todo-item-enter",
        todo.completed ? "bg-muted/50" : "bg-card hover:bg-accent/5"
      )}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="flex items-center gap-3">
        <div className="relative touch-target flex items-center justify-center">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggle}
            className={cn(
              "transition-all duration-150",
              todo.completed && "bg-success border-success"
            )}
          />
          {todo.completed && (
            <Check 
              className="absolute h-3 w-3 text-success-foreground checkmark-animation" 
              strokeWidth={3}
            />
          )}
        </div>
        
        {isEditing ? (
          <div className="flex-1 flex gap-2 animate-fade-in">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-accent focus-visible:ring-accent"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleEdit} 
              title="Save"
              className="hover:bg-success/10 hover:text-success"
            >
              <Check size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { setEditText(todo.text); setIsEditing(false); }}
              title="Cancel"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X size={18} />
            </Button>
          </div>
        ) : (
          <>
            <span 
              className={cn(
                "flex-1 transition-all duration-200",
                todo.completed 
                  ? "line-through text-muted-foreground" 
                  : "text-foreground"
              )}
            >
              {todo.text}
            </span>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)} 
                className="h-8 w-8 hover:bg-secondary/10 hover:text-secondary"
                title="Edit"
              >
                <Pencil size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                title="Delete"
              >
                <Trash size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Task metadata - only show when not editing */}
      {!isEditing && (showOptions || todo.priority || todo.dueDate) && (
        <div className="flex flex-wrap items-center gap-2 pl-8 mt-1">
          {/* Priority selector */}
          <TodoItemPriority 
            todoId={todo.id} 
            priority={todo.priority || 'low'} 
          />
          
          {/* Due date selector */}
          <TodoDueDate 
            todoId={todo.id}
            dueDate={todo.dueDate}
          />
          
          {/* Due date indicator (when date is set) */}
          {todo.dueDate && dueDateLabel && (
            <span className="text-xs text-muted-foreground ml-auto">
              {dueDateLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
