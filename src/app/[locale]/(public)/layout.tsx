import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarfieldCanvas } from "@/components/three/StarfieldCanvas";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPromptProvider } from "@/components/install/InstallPromptProvider";
import { FloatingInstallCard } from "@/components/install/FloatingInstallCard";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <InstallPromptProvider>
      <StarfieldCanvas />
      <Header />
      <main className="relative">{children}</main>
      <Footer />
      <ServiceWorkerRegistration />
      <FloatingInstallCard />
    </InstallPromptProvider>
  );
}
