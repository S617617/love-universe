"use client";
import { Records } from "./records";
import type { CollectionKey } from "@/lib/store";
import Link from "next/link";
export function RecordDetail({ kind, id }: { kind: string; id: string }) {
  return (
    <div className="container module-page">
      <Link className="subtle-link" href={`/${kind}`}>
        ← 返回全部记录
      </Link>
      <Records kind={kind as CollectionKey} initialId={id} />
    </div>
  );
}
