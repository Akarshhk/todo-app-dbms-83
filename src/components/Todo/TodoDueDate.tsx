
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { useTodo } from "@/contexts/TodoContext";
import { cn } from "@/lib/utils";

interface TodoDueDateProps {
  todoId: string;
  dueDate?: number;
}

export function TodoDueDate({ todoId, dueDate }: TodoDueDateProps) {
  const { setDueDate } = useTodo();
  const [open, setOpen] = useState(false);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDueDate(todoId, date.getTime());
    } else {
      // Clear due date if user selects nothing
      setDueDate(todoId, 0);
    }
    setOpen(false);
  };
  
  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDueDate(todoId, 0);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "h-8 border-dashed text-xs justify-start",
            dueDate ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {dueDate ? (
            <span className="flex items-center gap-1">
              {format(dueDate, "MMM d, yyyy")}
              <X 
                className="h-3 w-3 opacity-70 hover:opacity-100" 
                onClick={handleClearDate} 
              />
            </span>
          ) : (
            "Set due date"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dueDate ? new Date(dueDate) : undefined}
          onSelect={handleDateSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
