import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | LLM Gateway",
  description: "Sign in to chat with AI and ask questions about your PDFs.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      activeTab="login"
      title="Welcome Back"
      subtitle="Sign in to start chatting"
    >
      <LoginForm />
    </AuthLayout>
  );
}

