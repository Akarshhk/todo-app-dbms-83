
import { useToast } from "@/hooks/use-toast";
import { useTodo } from "@/contexts/todo";
import { 
  AlertTriangle, 
  BarChart3,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TodoItemPriorityProps {
  todoId: string;
  priority: 'high' | 'medium' | 'low' | undefined;
}

export function TodoItemPriority({ todoId, priority = 'low' }: TodoItemPriorityProps) {
  const { setPriority } = useTodo();
  const { toast } = useToast();
  
  const handlePriorityChange = async (newPriority: 'high' | 'medium' | 'low') => {
    try {
      await setPriority(todoId, newPriority);
    } catch (error) {
      toast({
        title: "Failed to update priority",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getPriorityIcon = () => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium':
        return <BarChart3 size={16} className="text-amber-500" />;
      default:
        return <BarChart3 size={16} className="text-blue-500" />;
    }
  };
  
  const getPriorityLabel = () => {
    switch (priority) {
      case 'high':
        return "High";
      case 'medium':
        return "Medium";
      default:
        return "Low";
    }
  };
  
  const getPriorityClass = () => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case 'medium':
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 text-xs rounded border",
          getPriorityClass()
        )}>
          {getPriorityIcon()}
          <span>{getPriorityLabel()}</span>
          <ChevronDown size={14} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => handlePriorityChange('high')}
        >
          <AlertTriangle size={16} className="text-red-500" />
          High
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => handlePriorityChange('medium')}
        >
          <BarChart3 size={16} className="text-amber-500" />
          Medium
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => handlePriorityChange('low')}
        >
          <BarChart3 size={16} className="text-blue-500" />
          Low
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
