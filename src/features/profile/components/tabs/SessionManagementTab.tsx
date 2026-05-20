/**
 * Session Management Tab Component
 * 
 * View and manage active sessions (devices).
 */

import { useState } from "react";
import { Button } from "@/src/shared/components/ui/Button";
import {
  Devices,
  Desktop,
  DeviceMobile,
  SignOut,
  CheckCircle,
  Warning,
  Clock
} from "@phosphor-icons/react";
import { useMySessions } from "@/src/features/profile/hooks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ToastState } from "@/src/shared/hooks/useToast";

interface SessionManagementTabProps {
  showToast: (tone: ToastState["tone"], message: string) => void;
}

export function SessionManagementTab({ showToast }: SessionManagementTabProps) {
  const { data: sessions, isLoading, error, removeSession, removeAllOtherSessions } = useMySessions();
  const [removingSessionId, setRemovingSessionId] = useState<string | null>(null);
  const [removingAll, setRemovingAll] = useState(false);

  const handleRemoveSession = async (sessionId: string) => {
    if (!confirm("Bạn có chắc muốn đăng xuất thiết bị này?")) return;

    setRemovingSessionId(sessionId);
    const result = await removeSession(sessionId);
    setRemovingSessionId(null);

    if (result.success) {
      showToast("success", "Đã đăng xuất thiết bị thành công!");
    } else {
      showToast("error", result.error || "Không thể đăng xuất thiết bị");
    }
  };

  const handleRemoveAllOthers = async () => {
    if (!confirm("Bạn có chắc muốn đăng xuất tất cả thiết bị khác? Thiết bị hiện tại sẽ không bị ảnh hưởng.")) return;

    setRemovingAll(true);
    const result = await removeAllOtherSessions();
    setRemovingAll(false);

    if (result.success) {
      showToast("success", "Đã đăng xuất tất cả thiết bị khác thành công!");
    } else {
      showToast("error", result.error || "Không thể đăng xuất tất cả thiết bị");
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    const lowerName = deviceName.toLowerCase();
    if (lowerName.includes("mobile") || lowerName.includes("iphone") || lowerName.includes("android")) {
      return <DeviceMobile className="h-6 w-6" weight="fill" />;
    }
    return <Desktop className="h-6 w-6" weight="fill" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
          <Warning className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" weight="fill" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Logout All Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Devices className="h-6 w-6 text-foreground" weight="fill" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Thiết bị đã đăng nhập</h2>
            <p className="text-sm text-muted">Quản lý các thiết bị đang truy cập tài khoản của bạn</p>
          </div>
        </div>
        {otherSessions.length > 0 && (
          <Button
            onClick={handleRemoveAllOthers}
            variant="danger"
            size="sm"
            isLoading={removingAll}
            leftIcon={<SignOut className="h-4 w-4" />}
          >
            Đăng xuất tất cả
          </Button>
        )}
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="text-emerald-600 dark:text-emerald-400">
              {getDeviceIcon(currentSession.deviceName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">{currentSession.deviceName}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  <CheckCircle className="h-3 w-3" weight="fill" />
                  Thiết bị này
                </span>
              </div>
              <div className="space-y-1 text-sm text-muted">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">IP:</span>
                  <span>{currentSession.ipAddress}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Hoạt động lần cuối: {formatDate(currentSession.lastUsedAt)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Đăng nhập lúc:</span>
                  <span>{formatDate(currentSession.createdAt)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider">
            Thiết bị khác ({otherSessions.length})
          </h3>
          {otherSessions.map((session) => (
            <div
              key={session.id}
              className="p-5 bg-surface-1 border border-border rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-muted">
                  {getDeviceIcon(session.deviceName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground mb-1">{session.deviceName}</h3>
                  <div className="space-y-1 text-sm text-muted">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">IP:</span>
                      <span>{session.ipAddress}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Hoạt động lần cuối: {formatDate(session.lastUsedAt)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Đăng nhập lúc:</span>
                      <span>{formatDate(session.createdAt)}</span>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleRemoveSession(session.id)}
                  variant="danger"
                  size="sm"
                  isLoading={removingSessionId === session.id}
                  leftIcon={<SignOut className="h-4 w-4" />}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-surface-2 border border-border rounded-xl text-center">
          <Devices className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">Không có thiết bị nào khác đang đăng nhập</p>
        </div>
      )}

      {/* Info Note */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Lưu ý:</strong> Nếu bạn thấy thiết bị lạ, hãy đăng xuất ngay và đổi mật khẩu để bảo vệ tài khoản.
        </p>
      </div>
    </div>
  );
}
