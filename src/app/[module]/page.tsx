import { notFound } from "next/navigation";
import { modules } from "@/lib/catalog";
import { ModulePage } from "@/components/module-page";
export const dynamicParams = false;
export function generateStaticParams() {
  return [...modules.map((m) => ({ module: m.id })), { module: "settings" }];
}
export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (module !== "settings" && !modules.some((m) => m.id === module))
    notFound();
  return <ModulePage id={module} />;
}
