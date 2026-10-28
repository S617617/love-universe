import { Suspense } from "react";
import { StaticRecordReader } from "@/components/static-record-reader";
import { READABLE_MODULES } from "@/lib/paths";
export const dynamicParams = false;
export function generateStaticParams() {
  return READABLE_MODULES.map((module) => ({ module }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  return (
    <Suspense fallback={<div className="loading">正在展开这段心意…</div>}>
      <StaticRecordReader kind={module} />
    </Suspense>
  );
}
