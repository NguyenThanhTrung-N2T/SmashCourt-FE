interface ErrorStateProps {
 message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
 return (
 <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
 <p className="text-red-600 font-semibold">Lỗi khi tải dữ liệu bảng giá</p>
 <p className="text-red-500 text-sm mt-1">{message}</p>
 </div>
 );
}
