"use client";

import { App } from "antd";
import { SessionProvider } from "next-auth/react";

/**
 * Client-side wrapper that provides both NextAuth Session context
 * and Ant Design `App` context globally.
 */
export default function AntdProvider({ children }) {
  return (
    <SessionProvider>
      <App
        message={{ maxCount: 3, duration: 2 }}
        notification={{ placement: "topRight" }}
      >
        {children}
      </App>
    </SessionProvider>
  );
}
