"use client";
import { MotionConfig } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Heart, Settings, Menu, X, ArrowLeft, Sparkles } from "lucide-react";
import { normalizePath } from "@/lib/paths";
import { useData } from "@/lib/store";
export function Shell({ children }: { children: ReactNode }) {
  const path = normalizePath(usePathname());
  const [menu, setMenu] = useState(false);
  const { data, ready, error, clearError } = useData();
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`app theme-${data.settings.theme} bg-${data.settings.background}`}
      >
        <div className="star-field" aria-hidden="true" />
        <header className="nav-wrap">
          <nav className="nav">
            <Link href="/" className="brand" onClick={() => setMenu(false)}>
              <span className="brand-icon">
                <Heart size={20} />
                <i />
              </span>
              <span>
                Love <b>Universe</b>
                <small>JUST THE TWO OF US</small>
              </span>
            </Link>
            <div className={`nav-links ${menu ? "open" : ""}`}>
              <Link
                onClick={() => setMenu(false)}
                href="/"
                className={path === "/" ? "active" : ""}
              >
                首页
              </Link>
              <Link onClick={() => setMenu(false)} href="/#explore">
                恋爱空间 <Sparkles size={13} />
              </Link>
              <Link
                onClick={() => setMenu(false)}
                href="/story"
                className={path === "/story" ? "active" : ""}
              >
                我们的故事
              </Link>
            </div>
            <div className="nav-end">
              <span className="private-dot">免登录 · 公开体验</span>
              <Link
                href="/settings"
                className="icon-button"
                aria-label="个人设置"
              >
                <Settings size={19} />
              </Link>
              <button
                className="icon-button mobile-menu"
                onClick={() => setMenu(!menu)}
                aria-label="切换导航"
                aria-expanded={menu}
              >
                {menu ? <X /> : <Menu />}
              </button>
            </div>
          </nav>
        </header>
        {error && (
          <div className="global-error" role="alert">
            {error}
            <button onClick={clearError}>关闭</button>
          </div>
        )}
        {ready && (
          <section className="demo-banner container" aria-label="公开演示说明">
            <span className="demo-pill">PUBLIC DEMO</span>
            <p>
              {data.settings.demoProfile
                ? "林间与星禾是虚构示例角色。"
                : "欢迎写下你自己的故事。"}{" "}
              标注「示例记录」的内容来自演示素材；更改仅保存在当前浏览器，不会云端同步或对外共享。
            </p>
            <Link href="/settings#demo-reset">恢复演示数据 ↗</Link>
          </section>
        )}
        <main>
          {path !== "/" && (
            <div className="back-bar container">
              <Link href="/">
                <ArrowLeft size={16} />
                返回我们的小宇宙
              </Link>
              <span>LOVE UNIVERSE / {path.split("/")[1].toUpperCase()}</span>
            </div>
          )}
          {ready ? (
            children
          ) : (
            <div className="loading">
              <Sparkles className="spin" />
              正在点亮我们的宇宙…
            </div>
          )}
        </main>
        <footer className="footer container">
          <Link className="footer-brand" href="/">
            <Heart size={16} /> Love Universe
          </Link>
          <p>宇宙有无数星辰，而我只偏爱你这一颗。</p>
          <span>免登录体验 · 本机保存 · 无云同步</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
