"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /notebook just redirects to the dashboard.
 * The actual notebook editor lives at /notebook/[id].
 */
export default function NotebookIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto" }} />
      <div className="loading-text" style={{ marginTop: 12 }}>
        Redirecting to dashboard…
      </div>
    </div>
  );
}
