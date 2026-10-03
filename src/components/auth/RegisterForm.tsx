"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FetchError } from "@/lib/api";
import {
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  SpinnerIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@/components/icons";

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Dynamic Password Strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score: 25, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-blue-500" };
      case 4:
      default:
        return { score: 100, label: "Strong", color: "bg-emerald-500" };
    }
  }, [password]);

  const validate = (): boolean => {
    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (!name.trim()) {
      nextErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof FetchError) {
        if (err.status === 409) {
          setErrorMessage("An account with this email already exists. Please sign in instead.");
        } else if (err.status === 0) {
          setErrorMessage("Cannot connect to server. Please check your network or server status.");
        } else {
          setErrorMessage(err.message || "Registration failed. Please try again.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Registration failed. An account with this email may already exist.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <div className="space-y-5">
      {/* Top Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed"
        >
          <AlertCircleIcon size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-name"
            className="block text-xs font-medium text-zinc-300"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <UserIcon size={16} />
            </div>
            <input
              id="register-name"
              type="text"
              name="name"
              autoComplete="name"
              disabled={isBusy}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Asim Khan"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              className={`w-full rounded-xl bg-zinc-950/70 pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 border transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.name
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
          </div>
          {errors.name && (
            <p id="register-name-error" className="text-[11px] text-red-400 pl-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-email"
            className="block text-xs font-medium text-zinc-300"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <MailIcon size={16} />
            </div>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              disabled={isBusy}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="name@organization.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              className={`w-full rounded-xl bg-zinc-950/70 pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 border transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.email
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
          </div>
          {errors.email && (
            <p id="register-email-error" className="text-[11px] text-red-400 pl-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-password"
            className="block text-xs font-medium text-zinc-300"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <LockIcon size={16} />
            </div>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              disabled={isBusy}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Create a strong password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "register-password-error" : undefined}
              className={`w-full rounded-xl bg-zinc-950/70 pl-9 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 border transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.password
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">Password strength</span>
                <span className="font-medium text-zinc-300">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
            </div>
          )}

          {errors.password && (
            <p id="register-password-error" className="text-[11px] text-red-400 pl-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Terms and compliance notice */}
        <div className="flex items-start gap-2 pt-1 text-[11px] text-zinc-400">
          <CheckCircleIcon size={14} className="text-indigo-400 shrink-0 mt-0.5" />
          <span>
            By registering, you gain access to the LLM Gateway API cluster and conversation context manager.
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isBusy ? (
            <>
              <SpinnerIcon size={14} />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create LLM Gateway Account</span>
              <ArrowRightIcon size={14} />
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

