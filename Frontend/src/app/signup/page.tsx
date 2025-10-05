'use client';
import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import GoogleSignInButton from "@/components/signInWithGoogle";

export default function SignUp() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to sign up");
      }

      toast.success("Account created successfully!");
      router.replace("/signin"); // redirect to signin page
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to sign up");
    }
  };

  // Disable button if passwords don't match or fields are empty
  const isSignUpDisabled =
    !name || !email || !password || !confirmPassword || password !== confirmPassword;

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
      <h2 className="text-center text-2xl font-bold text-gray-900">
        Create your account
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              required
              className="mt-1 w-full"
            />
          </div>

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

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              required
              className="mt-1 w-full"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>

        <Button className="w-full mt-4" disabled={isSignUpDisabled}>
          Sign Up
        </Button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="px-2 text-gray-400">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="mt-4">
        <GoogleSignInButton />
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <a href="/signin" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
