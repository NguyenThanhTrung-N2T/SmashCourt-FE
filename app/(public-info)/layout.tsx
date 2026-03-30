import type { ReactNode } from "react";

import PublicInfoHeader from "@/src/customer/components/PublicInfoHeader";
import PublicSiteFooter from "@/src/customer/components/PublicSiteFooter";
import ChatbotWidget from "@/src/customer/components/ChatbotWidget";

export default function PublicInfoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f6f8f4_38%,#ffffff_100%)] font-sans text-slate-900 selection:bg-emerald-200">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.06),_transparent_20%)]" />
      <PublicInfoHeader />
      <main className="pt-36 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <PublicSiteFooter />
      <ChatbotWidget />
    </div>
  );
}
