import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

/**
 * Tạo SignalR connection builder
 * @param accessToken JWT token để authenticate
 * @returns HubConnection instance
 */
export function createSignalRConnection(accessToken: string): HubConnection {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5179";
  const hubUrl = `${API_URL}/hubs/notifications`;

  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => accessToken,
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
