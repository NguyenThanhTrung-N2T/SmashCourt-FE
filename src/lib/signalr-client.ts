import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getAccessToken } from "@/src/features/auth/session/sessionStore";
import { toUrl } from "@/src/api/core";

/**
 * Tạo SignalR connection builder
 * Hub dùng chung địa chỉ BE với REST (NEXT_PUBLIC_API_BASE_URL)
 * @returns HubConnection instance
 */
export function createSignalRConnection(): HubConnection {
  const hubUrl = toUrl("/hubs/notifications");

  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => getAccessToken() || "",
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Exponential backoff: 0s, 2s, 10s, 30s, max 60s
        if (retryContext.previousRetryCount === 0) return 0;
        if (retryContext.previousRetryCount === 1) return 2000;
        if (retryContext.previousRetryCount === 2) return 10000;
        if (retryContext.previousRetryCount === 3) return 30000;
        return 60000;
      },
    })
    .configureLogging(
      process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning
    )
    .build();

  return connection;
}
