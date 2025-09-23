'use client';
import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import GoogleSignInButton from "./signInWithGoogle";
import { useAuth } from "@/stores/useAuth";
import { useRouter } from "next/navigation";

export default function SignIn() {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("")

  const router = useRouter()

  const login = useAuth().login

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const isLoggedIn = await login(email, password)
      if (isLoggedIn == true)
        router.push("/dashboard")
    } catch(err){
      throw err
    }
  }

  return (

      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                className="mt-1 w-full"
              />
            </div>
          </div>

          <Button className="w-full mt-4" >
            Sign In
          </Button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="mt-4">
          {/* Google Sign-In */}
          <GoogleSignInButton></GoogleSignInButton>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
  );
}
