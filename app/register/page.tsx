"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, Lock, User, Loader2 } from "lucide-react"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      toast.success("Registered successfully")
      router.push("/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <Card className="w-[350px] bg-zinc-800 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-emerald-100">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-emerald-100">
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-emerald-500" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-8 bg-zinc-700 text-emerald-100 border-emerald-600"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-100">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-emerald-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 bg-zinc-700 text-emerald-100 border-emerald-600"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-100">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-emerald-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8 bg-zinc-700 text-emerald-100 border-emerald-600"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-emerald-100">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-emerald-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-8 bg-zinc-700 text-emerald-100 border-emerald-600"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-zinc-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-emerald-100">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

