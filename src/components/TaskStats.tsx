import { ClipboardList, CheckCircle2, CircleDashed, AlertTriangle, Clock } from "lucide-react";
import { Task } from "./TaskCard";
import { useMemo } from "react";

interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const stats = useMemo(() => {
    let todo = 0;
    let completed = 0;
    let highPriority = 0;
    let overdue = 0;

    const now = new Date();
    // Normalize today's date to midnight local time for fair comparison
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    tasks.forEach((task) => {
      if (task.status === "TODO") todo++;
      if (task.status === "DONE") completed++;
      if (task.priority === "HIGH") highPriority++;

      if (task.status !== "DONE" && task.dueDate) {
        // Parse the ISO date string "YYYY-MM-DD" safely
        const datePart = task.dueDate.split("T")[0];
        if (datePart) {
          const [year, month, day] = datePart.split("-");
          const dueTime = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
          if (dueTime < todayMidnight) {
            overdue++;
          }
        }
      }
    });

    return {
      total: tasks.length,
      todo,
      completed,
      highPriority,
      overdue,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      
      {/* Total Tasks */}
      <div className="flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 text-text-secondary mb-2">
          <ClipboardList className="w-4 h-4" />
          <span className="text-[12px] font-medium uppercase tracking-wider">Total</span>
        </div>
        <div className="text-2xl font-semibold text-text-primary">
          {stats.total}
        </div>
      </div>

      {/* To Do */}
      <div className="flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 text-text-secondary mb-2">
          <CircleDashed className="w-4 h-4" />
          <span className="text-[12px] font-medium uppercase tracking-wider">To Do</span>
        </div>
        <div className="text-2xl font-semibold text-text-primary">
          {stats.todo}
        </div>
      </div>

      {/* Completed */}
      <div className="flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 text-success mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[12px] font-medium uppercase tracking-wider text-text-secondary">Completed</span>
        </div>
        <div className="text-2xl font-semibold text-text-primary">
          {stats.completed}
        </div>
      </div>

      {/* High Priority */}
      <div className="flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 text-danger mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[12px] font-medium uppercase tracking-wider text-text-secondary">High Priority</span>
        </div>
        <div className="text-2xl font-semibold text-text-primary">
          {stats.highPriority}
        </div>
      </div>

      {/* Overdue */}
      <div className="flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm col-span-2 lg:col-span-1">
        <div className="flex items-center space-x-2 text-warning mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-[12px] font-medium uppercase tracking-wider text-text-secondary">Overdue</span>
        </div>
        <div className="text-2xl font-semibold text-text-primary">
          {stats.overdue}
        </div>
      </div>

    </div>
  );
}
