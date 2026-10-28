"use client";
import { Records } from "./records";
import Link from "next/link";
export function MemoryDetail({ id }: { id: string }) {
  return (
    <div className="container module-page">
      <Link className="subtle-link" href="/memories">
        ← 全部回忆
      </Link>
      <Records kind="memories" initialId={id} />
    </div>
  );
}
