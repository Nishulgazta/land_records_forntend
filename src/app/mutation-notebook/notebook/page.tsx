"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /mutation-notebook/notebook just redirects to the module dashboard.
 * The actual notebook editor lives at /mutation-notebook/notebook/[id].
 */
export default function MutationNotebookIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/mutation-notebook");
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
