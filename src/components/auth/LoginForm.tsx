"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FetchError } from "@/lib/api";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  SpinnerIcon,
  AlertCircleIcon,
  SparklesIcon,
} from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const { login, demoLogin, isLoading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};

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
      await login({ email: email.trim(), password });
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof FetchError) {
        if (err.status === 401) {
          setErrorMessage("Invalid email or password. Please verify and try again.");
        } else if (err.status === 0) {
          setErrorMessage("Cannot connect to server. Please check your network or server status.");
        } else {
          setErrorMessage(err.message || "Failed to sign in. Please try again.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Invalid email or password. Please verify and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await demoLogin();
      router.push("/");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to initialize demo session."
      );
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
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-xs font-medium text-zinc-300"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <MailIcon size={16} />
            </div>
            <input
              id="login-email"
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
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className={`w-full rounded-xl bg-zinc-950/70 pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 border transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.email
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
          </div>
          {errors.email && (
            <p id="login-email-error" className="text-[11px] text-red-400 pl-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-zinc-300"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => alert("Password recovery is managed by your LLM Gateway administrator.")}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <LockIcon size={16} />
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              disabled={isBusy}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-password-error" : undefined}
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
          {errors.password && (
            <p id="login-password-error" className="text-[11px] text-red-400 pl-1">
              {errors.password}
            </p>
          )}
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
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Gateway</span>
              <ArrowRightIcon size={14} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-zinc-800 w-full" />
        <span className="bg-zinc-900 px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-mono">
          Or Quick Access
        </span>
      </div>

      {/* Instant Demo Login Button */}
      <button
        type="button"
        onClick={handleDemoSignIn}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-zinc-200 text-xs font-medium transition-all duration-150 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        <SparklesIcon size={14} className="text-amber-400" />
        <span>Try Demo Mode (Instant Sandbox)</span>
      </button>

      {/* Bottom Switch Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-zinc-400">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

