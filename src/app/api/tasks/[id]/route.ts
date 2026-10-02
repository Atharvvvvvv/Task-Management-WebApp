import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTaskSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params to support both synchronous and asynchronous params objects (Next.js 15+)
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Validate body
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const dataToUpdate: any = { ...parsed.data };
    if (dataToUpdate.dueDate !== undefined && dataToUpdate.dueDate !== null) {
        dataToUpdate.dueDate = new Date(dataToUpdate.dueDate);
    } else if (dataToUpdate.dueDate === null) {
        dataToUpdate.dueDate = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedTask, { status: 200 });

  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
