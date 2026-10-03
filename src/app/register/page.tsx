import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | LLM Gateway",
  description: "Create an account to access LLM routing, token budget controls, and resilient conversation management.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      activeTab="register"
      title="Create Account"
      subtitle="Register to start orchestrating LLMs"
    >
      <RegisterForm />
    </AuthLayout>
  );
}

