import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export function TodayTasks() {
  const queryClient = useQueryClient();
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/today/1"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today/1"] });
    },
  });

  const handleTaskToggle = (taskId: number, completed: boolean) => {
    const status = completed ? "completed" : "pending";
    updateTaskMutation.mutate({ taskId, status });
  };

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No tasks for today</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material">
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-3">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
              disabled={updateTaskMutation.isPending}
            />
            <span 
              className={`text-sm ${
                task.status === "completed" 
                  ? "text-gray-500 line-through" 
                  : "text-gray-700"
              }`}
            >
              {task.title}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
