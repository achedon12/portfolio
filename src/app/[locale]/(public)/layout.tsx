import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarfieldCanvas } from "@/components/three/StarfieldCanvas";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <StarfieldCanvas />
      <Header />
      <main className="relative">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
