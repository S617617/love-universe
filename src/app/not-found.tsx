import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <span>✧</span>
      <h1>这颗星球还没有被发现</h1>
      <p>回到熟悉的轨道，继续探索我们的宇宙。</p>
      <Link className="button" href="/">
        返回首页
      </Link>
    </div>
  );
}
