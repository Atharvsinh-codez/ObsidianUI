import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { RaisedButton } from "@/components/ui/raised-button";
import { cn } from "@/lib/utils";
import { GoldenGateScene } from "./not-found/golden-gate-scene";
import "./not-found-page.css";

const display = Instrument_Serif({
  variable: "--font-nf-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function NotFoundPage() {
  return (
    <main id="main-content" className={cn("obsidianui-404", display.variable)}>
      <section className="obsidianui-404-card" aria-labelledby="not-found-title">
        <GoldenGateScene className="obsidianui-404-scene" />
        <div className="obsidianui-404-haze" aria-hidden="true" />

        <div className="obsidianui-404-copy">
          <h1 id="not-found-title" data-text="404">
            <span className="obsidianui-404-code">404</span>
            <span className="sr-only">: page not found</span>
          </h1>
          <p className="obsidianui-404-lede">This page drifted out past the Golden Gate.</p>
          <RaisedButton asChild color="#000000" size="lg" className="obsidianui-404-home no-underline rounded-xl before:rounded-xl">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Back home
            </Link>
          </RaisedButton>
        </div>
      </section>
    </main>
  );
}
