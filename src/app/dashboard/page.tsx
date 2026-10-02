import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import TaskList from "@/components/TaskList"
import { LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-surface">
        <div className="font-semibold text-lg text-text-primary tracking-tight">
          TaskFlow
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <span className="text-[13px] font-medium text-text-secondary hidden sm:inline-block">
            {session.user.email}
          </span>
          
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <button
              type="submit"
              className="inline-flex items-center justify-center h-8 px-3 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Log out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Dashboard
            </h1>
            <p className="text-[13px] text-text-secondary mt-1">
              Manage your tasks and stay productive.
            </p>
          </div>
        </div>

        <TaskList />
      </main>
    </div>
  )
}
