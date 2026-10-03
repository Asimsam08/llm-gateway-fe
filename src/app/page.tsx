import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "Dashboard | LLM Gateway",
  description: "Manage LLM conversations, context windows, and token budgets.",
};

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col bg-[#090a0f] overflow-hidden">
      <HomeContent />
    </div>
  );
}
