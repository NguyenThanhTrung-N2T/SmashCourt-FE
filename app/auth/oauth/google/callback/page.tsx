import { Suspense } from "react";

import GoogleOauthCallbackClient from "./GoogleOauthCallbackClient";

export default function GoogleOauthCallbackPage() {
  return (
    <Suspense
      fallback={
        <section>
          <h2 className="text-2xl font-semibold">Đăng nhập với Google</h2>
          <p className="mt-2 text-sm opacity-80">Đang kết nối với Google...</p>
        </section>
      }
    >
      <GoogleOauthCallbackClient />
    </Suspense>
  );
}

