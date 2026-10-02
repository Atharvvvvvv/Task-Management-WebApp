"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function CreateTaskForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    setError(null);
    try {
      // If dueDate is empty string, make it undefined/null
      const payload = {
        ...data,
        dueDate: data.dueDate ? data.dueDate : undefined,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-surface border border-border rounded-lg p-4 sm:p-6 shadow-sm mb-6 w-full max-w-2xl"
    >
      <h2 className="text-[15px] font-medium text-text-primary mb-4">
        Create New Task
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-text-primary">
            Title
          </label>
          <input
            {...register("title")}
            type="text"
            className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-text-muted"
            placeholder="e.g. Complete quarterly report"
          />
          {errors.title && (
            <p className="text-[13px] text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-text-primary">
            Description
          </label>
          <textarea
            {...register("description")}
            className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-text-muted min-h-[80px]"
            placeholder="Add some details..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="text-[13px] font-medium text-text-primary">
              Priority
            </label>
            <select
              {...register("priority")}
              className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="text-[13px] font-medium text-text-primary">
              Due Date
            </label>
            <input
              {...register("dueDate")}
              type="date"
              className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-md text-[13px] font-medium text-danger">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-text-primary bg-surface border border-border hover:bg-surface-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Task
          </button>
        </div>
      </div>
    </form>
  );
}
