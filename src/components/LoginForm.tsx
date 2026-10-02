"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    try {
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (response?.error) {
        setError("Invalid email or password")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 w-full">
      
      {/* Email Input */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-text-muted"
          placeholder="john@example.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-[13px] text-danger">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="flex flex-col space-y-1.5 pb-2">
        <label className="text-[13px] font-medium text-text-primary">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-text-muted"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-[13px] text-danger">{errors.password.message}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2.5 bg-danger/10 border border-danger/20 rounded-md text-[13px] font-medium text-danger">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center w-full h-9 px-4 py-2 text-[13px] font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {isSubmitting ? "Signing in..." : "Log in"}
      </button>

    </form>
  )
}
