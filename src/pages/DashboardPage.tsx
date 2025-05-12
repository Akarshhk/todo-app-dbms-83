
import { useTodo } from "@/contexts/todo";
import { useAuth } from "@/contexts/AuthContext";
import { TaskStatistics } from "@/components/Stats/TaskStatistics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { state } = useTodo();
  const { user } = useAuth();
  
  const recentlyCreatedTodos = [...state.todos]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  
  const highPriorityTodos = state.todos
    .filter(todo => todo.priority === 'high' && !todo.completed)
    .sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity))
    .slice(0, 5);
  
  // Helper function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || 'User'}
        </h1>
      </div>
      
      {/* Statistics section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <TaskStatistics />
      </section>
      
      {/* High Priority Tasks */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>High Priority Tasks</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/lists/inbox">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </div>
            <CardDescription>Your most important tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {highPriorityTodos.length > 0 ? (
              <ul className="space-y-2">
                {highPriorityTodos.map(todo => (
                  <li key={todo.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{todo.text}</span>
                    {todo.dueDate && (
                      <span className="text-sm text-muted-foreground">
                        Due: {formatDate(todo.dueDate)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No high priority tasks</p>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Tasks */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your recently created tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyCreatedTodos.length > 0 ? (
              <ul className="space-y-2">
                {recentlyCreatedTodos.map(todo => (
                  <li 
                    key={todo.id} 
                    className={`flex items-center p-2 border rounded ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    <span>{todo.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No tasks yet</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
