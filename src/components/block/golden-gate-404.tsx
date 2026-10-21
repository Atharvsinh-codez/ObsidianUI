import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { RaisedButton } from "@/components/ui/raised-button";
import { cn } from "@/lib/utils";
import { GoldenGateScene } from "./golden-gate-404/golden-gate-scene";
import "./golden-gate-404/golden-gate-404.css";

const display = Instrument_Serif({
  variable: "--font-golden-gate-404",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const TITLE_ID = "golden-gate-404-title";

export type GoldenGate404Props = {
  /** The big status code over the bay. */
  code?: string;
  /** Read after the code by screen readers, so the heading names the page. */
  title?: string;
  message?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

/**
 * A full-screen not-found page: the Golden Gate's north tower with live traffic, boats and fog,
 * in light and dark themes. Fills the viewport less `--obsidianui-404-offset` and stops page scroll.
 */
export function GoldenGate404({
  code = "404",
  title = "page not found",
  message = "This page drifted out past the Golden Gate.",
  href = "/",
  linkLabel = "Back home",
  className,
}: GoldenGate404Props) {
  return (
    <div className={cn("obsidianui-404", display.variable, className)}>
      <section className="obsidianui-404-card" aria-labelledby={TITLE_ID}>
        <GoldenGateScene className="obsidianui-404-scene" />
        <div className="obsidianui-404-haze" aria-hidden="true" />

        <div className="obsidianui-404-copy">
          <h1 id={TITLE_ID} data-text={code}>
            <span className="obsidianui-404-code">{code}</span>
            <span className="sr-only">: {title}</span>
          </h1>
          <p className="obsidianui-404-lede">{message}</p>
          <RaisedButton asChild color="#000000" size="lg" className="obsidianui-404-home no-underline rounded-xl before:rounded-xl">
            <Link href={href}>
              <ArrowLeft aria-hidden="true" />
              {linkLabel}
            </Link>
          </RaisedButton>
        </div>
      </section>
    </div>
  );
}

export default GoldenGate404;
