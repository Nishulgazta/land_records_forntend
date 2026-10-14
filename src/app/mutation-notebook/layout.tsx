import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./mutation-notebook.css";

export const metadata: Metadata = {
  title: "Smart Mutation Notebook",
  description:
    "Digital mutation notebook for land record officers. Write mutation entries with a stylus, convert handwriting to structured data, validate, and submit for review.",
};

export default function MutationNotebookLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mutation-notebook-root">
      <header className="app-header">
        <div className="app-header__logo">
          <span className="app-header__logo-icon" aria-hidden>
            📋
          </span>
          <span>Smart Mutation Notebook</span>
        </div>
        <nav className="app-header__nav">
          <Link href="/mutation-notebook" className="app-header__nav-link">
            Dashboard
          </Link>
          <Link
            href="/mutation-notebook/notebook"
            className="app-header__nav-link"
          >
            Notebook
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
