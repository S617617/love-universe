"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RecordDetail } from "./record-detail";
import { READABLE_MODULES } from "@/lib/paths";
import { Empty } from "./ui";
export function StaticRecordReader({ kind }: { kind: string }) {
  const params = useSearchParams();
  const id = params.get("id");
  if (!READABLE_MODULES.some((value) => value === kind) || !id)
    return (
      <div className="container module-page">
        <Empty
          title="这段心意还没有地址"
          text="请从对应模块选择一条记录。个人记录只存在于当前浏览器。"
        />
        <Link className="button" href="/">
          返回首页
        </Link>
      </div>
    );
  return <RecordDetail key={kind + id} kind={kind} id={id} />;
}
