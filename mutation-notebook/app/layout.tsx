import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Mutation Notebook — Land Record Digitization",
  description:
    "Digital mutation notebook for land record officers. Write mutation entries with a stylus, convert handwriting to structured data, validate, and submit for review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header__logo">
            <span className="app-header__logo-icon">📋</span>
            <span>Smart Mutation Notebook</span>
          </div>
          <nav className="app-header__nav">
            <a href="/" className="app-header__nav-link">
              Dashboard
            </a>
            <a href="/notebook" className="app-header__nav-link">
              Notebook
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
