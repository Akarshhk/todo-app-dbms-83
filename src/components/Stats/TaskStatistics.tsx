
import { useTodo } from "@/contexts/todo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export function TaskStatistics() {
  const { getTaskStatistics, state } = useTodo();
  const stats = getTaskStatistics();
  
  // Format for completion rate
  const completionRateFormatted = Math.round(stats.completionRate);
  
  // Prepare data for priority chart
  const priorityData = [
    { name: "High", value: stats.tasksByPriority.high, color: "#ef4444" },
    { name: "Medium", value: stats.tasksByPriority.medium, color: "#f59e0b" },
    { name: "Low", value: stats.tasksByPriority.low, color: "#3b82f6" }
  ];
  
  // Prepare data for list chart
  const listData = Object.keys(stats.tasksByList).map(listId => {
    const list = state.lists.find(l => l.id === listId);
    return {
      name: list ? list.name : listId,
      value: stats.tasksByList[listId],
      color: list ? list.color : "#64748b"
    };
  });
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Overall Completion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRateFormatted}%</div>
          <Progress className="mt-2" value={completionRateFormatted} />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">Completed today</div>
              <div className="font-medium">{stats.completedToday}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Completed this week</div>
              <div className="font-medium">{stats.completedThisWeek}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tasks by Priority */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasks by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Tasks by List */}
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasks by List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {listData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
