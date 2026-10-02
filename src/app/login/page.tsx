import LoginForm from "@/components/LoginForm"
import { Metadata } from "next"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

export const metadata: Metadata = {
  title: "Log in | Task Management App",
  description: "Log in to your account to manage your tasks.",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-text-primary tracking-tight hover:opacity-80 transition-opacity">
          TaskFlow
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-text-secondary">
              Log in to your account to continue.
            </p>
          </div>

          {/* Form Container */}
          <div className="w-full bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-sm">
            <LoginForm />
          </div>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="font-medium text-text-primary hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>

        </div>
      </main>
    </div>
  )
}
