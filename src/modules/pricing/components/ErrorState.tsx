interface ErrorStateProps {
    message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-red-700 font-semibold">Lỗi khi tải dữ liệu bảng giá</p>
            <p className="text-red-600 text-sm mt-1">{message}</p>
        </div>
    );
}
