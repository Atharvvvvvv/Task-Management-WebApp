"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import TaskCard, { Task } from "./TaskCard";
import CreateTaskForm from "./CreateTaskForm";
import TaskFilters, { SortOption } from "./TaskFilters";
import TaskStats from "./TaskStats";
import { Loader2, PlusCircle, AlertCircle, SearchX } from "lucide-react";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter & Sort State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = () => {
    setIsCreating(false);
    fetchTasks();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setSortBy("NEWEST");
  };

  const isFiltersActive =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    sortBy !== "NEWEST";

  // Derived filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description && t.description.toLowerCase().includes(s))
      );
    }

    // 2. Status
    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // 3. Priority
    if (priorityFilter !== "ALL") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "OLDEST") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "PRIORITY") {
        const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const pa = priorityOrder[a.priority] || 0;
        const pb = priorityOrder[b.priority] || 0;
        if (pa !== pb) return pb - pa;
        // Fallback to newest if priority is same
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "DUE_DATE") {
        if (!a.dueDate && !b.dueDate) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (!a.dueDate) return 1; // missing dates go to bottom
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  // Global Loading State
  if (isLoading && tasks.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading tasks...</p>
      </div>
    );
  }

  // Global Error State
  if (error && tasks.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4 bg-danger/5 border border-danger/20 rounded-lg text-danger">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p className="text-[13px] font-medium text-center">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-4 px-4 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-surface-muted transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Create Task Form / Trigger */}
      <div className="mb-6">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Task
          </button>
        ) : (
          <CreateTaskForm
            onSuccess={handleTaskCreated}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>

      {/* Zero tasks created ever */}
      {tasks.length === 0 && !isCreating ? (
        <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-surface-muted border border-border border-dashed rounded-lg">
          <div className="bg-surface p-3 rounded-full border border-border shadow-sm mb-4">
            <PlusCircle className="w-6 h-6 text-text-secondary" />
          </div>
          <h3 className="text-[15px] font-medium text-text-primary mb-1">
            No tasks yet
          </h3>
          <p className="text-[13px] text-text-secondary text-center max-w-sm mb-6">
            You don't have any tasks right now. Create your first task to get started.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Task
          </button>
        </div>
      ) : (
        <>
          <TaskStats tasks={tasks} />

          {/* Controls visible only if there are tasks in DB */}
          <TaskFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onClear={handleClearFilters}
            isActive={isFiltersActive}
          />

          {/* Render List or Empty Filtered State */}
          {filteredTasks.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-surface border border-border rounded-lg shadow-sm">
              <div className="bg-surface-muted p-3 rounded-full border border-border mb-4">
                <SearchX className="w-6 h-6 text-text-secondary" />
              </div>
              <h3 className="text-[15px] font-medium text-text-primary mb-1">
                No tasks found
              </h3>
              <p className="text-[13px] text-text-secondary text-center max-w-sm mb-4">
                No tasks match your current search or filter criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center h-8 px-4 text-[13px] font-medium text-text-primary bg-surface border border-border hover:bg-surface-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
