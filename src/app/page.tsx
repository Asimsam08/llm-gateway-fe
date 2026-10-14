import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "Dashboard | LLM Gateway",
  description: "Chat with AI and ask questions about your PDFs.",
};

export default function Home() {
  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-[#090a0f] overflow-hidden">
      <HomeContent />
    </div>
  );
}
