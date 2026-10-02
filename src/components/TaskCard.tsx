"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

interface TaskCardProps {
  task: Task;
  onUpdate?: () => void;
}

const editTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
});

type EditTaskValues = z.infer<typeof editTaskSchema>;

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const isCompleted = task.status === "DONE";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditTaskValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      priority: task.priority as any,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    },
  });

  const toggleStatus = async () => {
    if (isUpdating || isEditing || isConfirmingDelete) return;
    setIsUpdating(true);
    
    try {
      const newStatus = isCompleted ? "TODO" : "DONE";
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok && onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onEditSubmit = async (data: EditTaskValues) => {
    setEditError(null);
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate ? data.dueDate : null,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setEditError(err.message);
    }
  };

  const handleCancelEdit = () => {
    reset();
    setEditError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      if (onUpdate) onUpdate();
    } catch (err: any) {
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (isCompleted) return "text-text-muted bg-surface-muted border-border opacity-60";
    switch (priority) {
      case "HIGH":
        return "text-danger bg-danger/10 border-danger/20";
      case "MEDIUM":
        return "text-warning bg-warning/10 border-warning/20";
      case "LOW":
        return "text-primary bg-primary/10 border-primary/20";
      default:
        return "text-text-secondary bg-surface-muted border-border";
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (isConfirmingDelete) {
    return (
      <div className="flex flex-col p-4 bg-danger/5 border border-danger/20 rounded-lg shadow-sm w-full">
        <h3 className="font-medium text-[14px] text-danger mb-2">Delete Task</h3>
        <p className="text-[13px] text-text-secondary mb-4">
          Are you sure you want to delete <span className="font-medium text-text-primary">"{task.title}"</span>? This action cannot be undone.
        </p>
        
        {deleteError && (
          <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-md text-[13px] font-medium text-danger mb-4">
            {deleteError}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2 border-t border-danger/10">
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(false)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-[12px] font-medium text-text-primary bg-surface border border-border hover:bg-surface-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center px-3 py-1.5 text-[12px] font-medium text-primary-foreground bg-danger hover:bg-danger/90 rounded-md focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-1 transition-colors disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(onEditSubmit)}
        className="flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm w-full"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <input
              {...register("title")}
              type="text"
              className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-[15px] font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-text-muted"
              placeholder="Task title"
            />
            {errors.title && (
              <p className="text-[13px] text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <textarea
              {...register("description")}
              className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-text-muted min-h-[60px]"
              placeholder="Description..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              {...register("priority")}
              className="flex h-9 flex-1 rounded-md border border-border bg-input px-3 py-1 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <input
              {...register("dueDate")}
              type="date"
              className="flex h-9 flex-1 rounded-md border border-border bg-input px-3 py-1 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {editError && (
            <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-md text-[13px] font-medium text-danger">
              {editError}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-border mt-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 text-[12px] font-medium text-text-primary bg-surface border border-border hover:bg-surface-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-3 py-1.5 text-[12px] font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className={`flex flex-col p-4 bg-surface border border-border rounded-lg shadow-sm transition-all duration-200 group ${isCompleted ? 'opacity-70 bg-surface-muted' : 'hover:shadow-md'}`}>
      <div className="flex items-start mb-2">
        
        {/* Checkbox */}
        <div className="pt-0.5 mr-3 shrink-0">
          <button 
            type="button" 
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${
              isCompleted 
                ? 'bg-success border-success text-primary-foreground' 
                : 'bg-surface border-border hover:border-primary'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin text-text-primary" />
            ) : isCompleted ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className={`font-medium text-[15px] leading-tight transition-colors ${isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-1 shrink-0 ml-4">
              <span
                className={`px-2 py-0.5 mr-2 text-[11px] font-medium rounded-full border transition-colors ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded"
                aria-label="Edit task"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-secondary hover:text-danger hover:bg-danger/10 rounded"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className={`text-[13px] line-clamp-2 mt-1 mb-4 flex-1 transition-colors ${isCompleted ? 'text-text-muted/60' : 'text-text-secondary'}`}>
              {task.description}
            </p>
          )}
        </div>
      </div>
      
      <div className={`flex items-center space-x-4 mt-auto pt-4 text-[12px] border-t border-border transition-colors ${isCompleted ? 'text-text-muted/60' : 'text-text-muted'}`}>
        {task.dueDate && (
          <div className="flex items-center">
            <span className="font-medium mr-1">Due:</span>
            {formatDate(task.dueDate)}
          </div>
        )}
        <div className="flex items-center">
          <span className="font-medium mr-1">Created:</span>
          {formatDate(task.createdAt)}
        </div>
      </div>
    </div>
  );
}
