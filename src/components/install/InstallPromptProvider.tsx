"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallContextValue = {
  installable: boolean;
  installed: boolean;
  visitCount: number;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

const InstallContext = createContext<InstallContextValue | null>(null);

const VISIT_KEY = "ld:visit-count";
const INSTALLED_KEY = "ld:installed";

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(VISIT_KEY);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      const next = Number.isFinite(parsed) ? parsed + 1 : 1;
      window.localStorage.setItem(VISIT_KEY, String(next));
      setVisitCount(next);

      const flag = window.localStorage.getItem(INSTALLED_KEY);
      if (flag === "1") setInstalled(true);
    } catch {}

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) setInstalled(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setInstallable(true);
    };

    const onInstalled = () => {
      deferredRef.current = null;
      setInstallable(false);
      setInstalled(true);
      try {
        window.localStorage.setItem(INSTALLED_KEY, "1");
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const evt = deferredRef.current;
    if (!evt) return "unavailable" as const;
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      deferredRef.current = null;
      setInstallable(false);
      return choice.outcome;
    } catch {
      return "unavailable" as const;
    }
  }, []);

  const value = useMemo<InstallContextValue>(
    () => ({ installable, installed, visitCount, promptInstall }),
    [installable, installed, visitCount, promptInstall],
  );

  return <InstallContext.Provider value={value}>{children}</InstallContext.Provider>;
}

export function useInstallPrompt() {
  const ctx = useContext(InstallContext);
  if (!ctx) throw new Error("useInstallPrompt must be used inside InstallPromptProvider");
  return ctx;
}
