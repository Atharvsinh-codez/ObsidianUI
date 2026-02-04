"use client";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { VisitorCount } from "@/components/ui/visitor-count";

const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 md:px-12 lg:px-24 bg-[#f5f5f5] dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 md:gap-8">
          {/* Left Column - Logo and Description */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo/bg-less.png"
                alt="ObsidianUI"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                ObsidianUI
              </span>
            </Link>

            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              ObsidianUI empowers developers to build premium,
              motion-rich interfaces with ease. Transform your raw
              ideas into compelling visuals.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <Link
                href="https://x.com/athrix_codes"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors duration-200"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/Atharvsinh-codez"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors duration-200"
              >
                <Github className="w-4 h-4" />
              </Link>
            </div>

            {/* Regem Collaboration */}
            <div className="flex flex-col items-start gap-2 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <Link href="https://regem.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <div className="bg-white rounded-md p-1">
                  <img
                    src="/logo/regem-logo.png"
                    alt="Regem"
                    className="h-6 w-6 object-contain"
                  />
                </div>
              </Link>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Regem × ObsidianUI
              </span>
            </div>
          </div>

          {/* Middle Column - Product */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/components"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                >
                  Components
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                >
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column - Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/docs/installation"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/Atharvsinh-codez/ObsidianUI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/athrix_codes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Visitor Counter */}
        <div className="mt-8 flex justify-center">
          <VisitorCount />
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            © {new Date().getFullYear()} ObsidianUI. All rights reserved.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500 flex items-center gap-1">
            Made with <span className="text-red-500">❤️</span> by{" "}
            <a
              href="https://athrix.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neutral-700 dark:text-neutral-300 hover:underline"
            >
              Athrix.me
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
