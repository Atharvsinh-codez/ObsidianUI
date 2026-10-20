import type { Metadata } from "next";
import NotFoundPage from "@/components/pages/not-found-page";

export const metadata: Metadata = {
  title: "Page not found | ObsidianUI",
  description: "This ObsidianUI page does not exist. Browse the component library or documentation instead.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundPage />;
}
