"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewQueuePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/notices");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm">
      Redirecting to All Notices...
    </div>
  );
}
