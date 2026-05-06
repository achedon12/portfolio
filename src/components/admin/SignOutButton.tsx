"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className={className}
    >
      {children}
    </button>
  );
}
