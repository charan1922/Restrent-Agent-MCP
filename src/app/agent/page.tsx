"use client";

import React from "react";
import ConversationDemo from "./ConversationDemo";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Agent() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <ConversationDemo />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
