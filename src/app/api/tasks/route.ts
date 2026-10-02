import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : null),
})

export async function POST(req: Request) {
  try {
    // 1. Is user authenticated?
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Validate task data
    const body = await req.json()
    const parsed = taskSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: parsed.error.issues },
        { status: 400 }
      )
    }

    const { title, description, priority, dueDate } = parsed.data

    // 3. Get user ID from session and create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate,
        userId: session.user.id, // Securely use the authenticated user's ID
      },
    })

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
