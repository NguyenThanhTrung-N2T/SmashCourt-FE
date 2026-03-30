import { Building2 } from "lucide-react";

export default function BranchesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-slide-up">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/30 mb-6">
        <Building2 className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800">Quản lý Chi nhánh</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">
        Tính năng đang được phát triển. Sẽ ra mắt trong phiên bản tiếp theo.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600">
        Sắp ra mắt
      </div>
    </div>
  );
}
