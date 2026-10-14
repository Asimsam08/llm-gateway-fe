import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | LLM Gateway",
  description: "Create an account to chat with AI and ask questions about your PDFs.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      activeTab="register"
      title="Create Account"
      subtitle="Create an account to start chatting"
    >
      <RegisterForm />
    </AuthLayout>
  );
}

