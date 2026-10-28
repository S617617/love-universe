"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  Sparkles,
  ChevronRight,
  CalendarDays,
  NotebookPen,
  Camera,
} from "lucide-react";
import { useData, daysBetween, nextAnniversary, today } from "@/lib/store";
import { recordUrl } from "@/lib/paths";
import { modules } from "@/lib/catalog";
import { Photo, SourceBadge } from "./ui";
export function Home() {
  const reduceMotion = useReducedMotion();
  const { data } = useData();
  const s = data.settings;
  const [egg, setEgg] = useState(0);
  const [quote, setQuote] = useState(0);
  const quotes = [
    s.message,
    "想和你虚度的光阴，都是我最珍惜的日常。",
    "慢慢走吧，沿途的风景想和你一起看。",
    "今天也想把最好的一点温柔，留给你。",
  ];
  const journal = [...data.diary].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const photo = [
    ...data.memories.map((e) => ({ ...e, source: "memories" })),
    ...data.map.map((e) => ({ ...e, source: "map" })),
    ...data.diary.map((e) => ({ ...e, source: "diary" })),
  ]
    .filter((e) => e.photo)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const events = [
    { title: "我们的恋爱纪念日", date: s.start },
    ...data.universe,
  ]
    .map((e) => ({ ...e, next: nextAnniversary(e.date) }))
    .sort((a, b) => a.next.localeCompare(b.next));
  const next = events[0];
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="eyebrow">
              <span /> A LITTLE UNIVERSE, A LOT OF LOVE
            </div>
            <h1>
              世界很大，
              <br />
              而你是我的<span className="serif rose-text">小宇宙</span>
              <i>✧</i>
            </h1>
            <p className="hero-description">
              把每一次心动、每一段旅程、每一个平凡的日子，
              <br className="desktop" />
              收藏进只属于我们的宇宙。
            </p>
            <div className="couple">
              <div className="avatars">
                {s.avatar1 ? (
                  <Photo src={s.avatar1} alt={s.name1} />
                ) : (
                  <span>{s.name1[0]}</span>
                )}
                {s.avatar2 ? (
                  <Photo src={s.avatar2} alt={s.name2} />
                ) : (
                  <span>{s.name2[0]}</span>
                )}
              </div>
              <span>
                {s.name1} <Heart size={12} fill="currentColor" /> {s.name2}
                <small>从 {s.start.replaceAll("-", ".")}，到每一个明天</small>
              </span>
            </div>
            <div className="hero-actions">
              <Link className="button" href="#explore">
                探索我们的宇宙 <ArrowRight size={17} />
              </Link>
              <Link href="/memories" className="subtle-link">
                翻开我们的回忆 <ArrowUpRight size={16} />
              </Link>
            </div>
            {(!s.onboarded || s.demoProfile) && (
              <Link href="/settings" className="onboarding">
                ✦ 初次见面？为你们的小宇宙起个名字 <ChevronRight size={14} />
              </Link>
            )}
          </motion.div>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="art-spark s1">✦</div>
          <div className="art-spark s2">✧</div>
          <div className="art-spark s3">+</div>
          <div className="moon-small" />
          <button
            className="love-planet"
            aria-label="轻触爱心，发现彩蛋"
            onClick={() => setEgg(egg + 1)}
          >
            <div className="planet-grain" />
            <Heart className="planet-heart" strokeWidth={1.2} />
            <span>YOU & ME</span>
          </button>
          <div className="planet-ring" />
          <div className="floating-note">
            <span className="tiny-star">✦</span>
            <span>
              在一起的第 <b>{Math.max(1, daysBetween(s.start) + 1)}</b> 天
              <small>每一天，都比昨天更喜欢你一点。</small>
            </span>
          </div>
          <span className="art-caption">
            YOU ARE MY FAVORITE PLACE IN THE UNIVERSE.
          </span>
          {egg > 0 && (
            <p className="egg" role="status">
              {egg >= 5
                ? "解锁隐藏星球：名字叫「永远偏爱你」 ♡"
                : "叮！收到一颗心动信号 ♡"}
            </p>
          )}
        </div>
      </section>
      <section className="quote-bar container">
        <span className="quote-icon">“</span>
        <p>{quotes[quote]}</p>
        <button
          onClick={() =>
            setQuote(
              (quote +
                1 +
                (crypto.getRandomValues(new Uint32Array(1))[0] %
                  (quotes.length - 1))) %
                quotes.length,
            )
          }
          aria-label="换一句寄语"
        >
          换一句 <Sparkles size={13} />
        </button>
        <span className="daily-label">TODAY’S LOVE NOTE</span>
      </section>
      <section id="explore" className="explore container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">EXPLORE OUR UNIVERSE</div>
            <h2>
              十一种方式，<span className="serif">继续相爱</span>
              <span className="heading-star">✧</span>
            </h2>
          </div>
          <p>让爱有迹可循，让浪漫在日常发生。</p>
        </div>
        <div className="module-grid">
          {modules.map((m, i) => (
            <Link
              href={`/${m.id}`}
              key={m.id}
              className={`module-card ${m.color} module-${i}`}
            >
              <div className="module-top">
                <span className="module-icon">
                  <m.icon size={23} strokeWidth={1.4} />
                </span>
                <span className="module-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="module-arrow" size={18} />
              </div>
              <div className="card-art" aria-hidden="true">
                {[1, 2, 4, 6, 7, 9, 10].includes(i) ? (
                  <m.icon
                    className="feature-art-icon"
                    size={70}
                    strokeWidth={0.7}
                  />
                ) : (
                  <span>{m.symbol}</span>
                )}
                <i />
                <b>✦</b>
              </div>
              <div className="module-copy">
                <small>{m.en}</small>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="recent container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">LITTLE MOMENTS, BIG FEELINGS</div>
            <h2>
              我们宇宙里的<span className="serif">最近发生</span>
            </h2>
          </div>
          <span className="muted">每一件小事，都值得被记住</span>
        </div>
        <div className="recent-grid">
          <Link href="/diary" className="recent-card">
            <span className="recent-label">
              <NotebookPen size={16} />
              最近的日记 <ArrowUpRight size={15} />
            </span>
            {journal && <SourceBadge source={journal.source} />}
            <small>{journal?.date || today()}</small>
            <h3>{journal?.title || "今天，有什么想记下的吗？"}</h3>
            <p>
              {journal?.body.slice(0, 75) ||
                "一次散步、一顿晚餐、一句让你笑了很久的话……都是值得收藏的日常。"}
            </p>
            <span className="subtle-link">
              {journal ? "重温这一天" : "写下第一篇日记"}{" "}
              <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/universe" className="recent-card countdown">
            <span className="recent-label">
              <CalendarDays size={16} />
              下一个特别的日子 <ArrowUpRight size={15} />
            </span>
            <div className="count-number">
              {daysBetween(today(), next.next)}
              <small>天</small>
              <span>✧</span>
            </div>
            <h3>{next.title}</h3>
            <small>{next.next} · 值得期待的每一天</small>
          </Link>
          <Link
            href={photo ? recordUrl(photo.source, photo.id) : "/map"}
            className="recent-card memory-preview"
          >
            <span className="recent-label">
              <Camera size={16} />
              回忆的切片 <ArrowUpRight size={15} />
            </span>
            {photo ? (
              <>
                <Photo src={photo.photo} alt={photo.title} />
                <h3>{photo.title}</h3>
              </>
            ) : (
              <>
                <div className="landscape">
                  <i className="sun" />
                  <i className="hill one" />
                  <i className="hill two" />
                  <span>OUR NEXT ADVENTURE</span>
                </div>
                <h3>下一站，和你一起</h3>
                <p>收藏第一张照片，点亮一段回忆。</p>
              </>
            )}
          </Link>
        </div>
      </section>
      <section className="closing container">
        <span>✦</span>
        <h2 className="serif">所有的浪漫，都从「我们」开始。</h2>
        <p>不需要多么盛大的故事，只想把普通的日子，和你一起过。</p>
        <Link href="/letters">
          给你写一封信 <ArrowUpRight size={15} />
        </Link>
      </section>
    </>
  );
}
