"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h2>宇宙暂时走神了</h2>
      <p>请重试。已保存的本地记录不会因此删除。</p>
      <button className="button" onClick={reset}>
        再试一次
      </button>
    </div>
  );
}
