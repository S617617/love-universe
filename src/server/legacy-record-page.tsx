import { notFound } from "next/navigation";
import { RecordDetail } from "@/components/record-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ module: string; entry: string }>;
}) {
  const { module, entry } = await params;
  if (
    ![
      "story",
      "diary",
      "letters",
      "universe",
      "growth",
      "future-mailbox",
      "map",
    ].includes(module)
  )
    notFound();
  return <RecordDetail kind={module} id={entry} />;
}
