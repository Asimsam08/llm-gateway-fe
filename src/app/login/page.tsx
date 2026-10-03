import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | LLM Gateway",
  description: "Sign in to orchestrate LLMs, manage token budgets, and view conversation histories.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      activeTab="login"
      title="Welcome Back"
      subtitle="Sign in to your LLM Gateway account"
    >
      <LoginForm />
    </AuthLayout>
  );
}

