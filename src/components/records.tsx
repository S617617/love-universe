"use client";
import { useState, useMemo } from "react";
import { EntryEditor } from "./entry-editor";
import { labels } from "@/lib/record-labels";
import Link from "next/link";
import { recordUrl } from "@/lib/paths";
import { unlockDemoChapter } from "@/lib/demo-services";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Plus,
  Heart,
  Search,
  PenLine,
  Trash2,
  ArrowUp,
  ArrowDown,
  LockKeyhole,
  BookOpen,
  Check,
  Map,
  LayoutList,
} from "lucide-react";
import {
  useData,
  makeEntry,
  today,
  daysBetween,
  nextAnniversary,
  type Entry,
  type CollectionKey,
} from "@/lib/store";
import { Modal, Empty, Photo, Notice, SourceBadge, MusicPlayer } from "./ui";
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="map-loading">正在展开地图…</div>,
});
export function Records({
  kind,
  initialId,
}: {
  kind: CollectionKey;
  initialId?: string;
}) {
  const { data, update } = useData();
  const router = useRouter();
  const [edit, setEdit] = useState<Entry | null>(null);
  const [reading, setReading] = useState<string | null>(initialId || null);
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("");
  const [sort, setSort] = useState("desc");
  const [view, setView] = useState("map");
  const [status, setStatus] = useState("");
  const [review, setReview] = useState("");
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState("week");
  const items = useMemo(
    () =>
      data[kind]
        .filter(
          (e) =>
            (!query ||
              `${e.title} ${e.hidden && !unlocked.includes(e.id) ? "" : e.body}`.includes(
                query,
              )) &&
            (!mood || e.mood === mood),
        )
        .sort((a, b) =>
          kind === "story"
            ? a.order - b.order
            : sort === "asc"
              ? a.date.localeCompare(b.date)
              : b.date.localeCompare(a.date),
        ),
    [data, kind, query, mood, sort, unlocked],
  );
  const selected = data[kind].find((e) => e.id === reading);
  const closeReader = () => {
    if (initialId) router.push(`/${kind}`);
    else setReading(null);
  };
  const remove = (e: Entry) => {
    if (confirm(`确定删除「${e.title}」吗？此操作无法撤销。`)) {
      if (
        update((d) => ({ ...d, [kind]: d[kind].filter((x) => x.id !== e.id) }))
      ) {
        setReading(null);
        setStatus("已删除这条记录");
      }
    }
  };
  const save = (draft: Entry) => {
    const e: Entry = { ...draft, source: "personal" };
    if (
      update((d) => ({
        ...d,
        [kind]: d[kind].some((x) => x.id === e.id)
          ? d[kind].map((x) => (x.id === e.id ? e : x))
          : [...d[kind], e],
      }))
    ) {
      setEdit(null);
      setStatus("已保存到我们的小宇宙");
    }
  };
  const move = (e: Entry, dir: number) => {
    const sorted = [...data.story].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === e.id);
    if (i + dir < 0 || i + dir >= sorted.length) return;
    [sorted[i], sorted[i + dir]] = [sorted[i + dir], sorted[i]];
    update((d) => ({
      ...d,
      story: sorted.map((x, i) => ({ ...x, order: i })),
    }));
  };
  const checkin = (e: Entry) => {
    if (e.checkins.includes(today())) {
      setStatus("今天已经一起努力过啦，休息也很重要。");
      return;
    }
    const progress = Math.min(e.target, e.progress + 1);
    update((d) => ({
      ...d,
      growth: d.growth.map((x) =>
        x.id === e.id
          ? { ...x, progress, checkins: [...x.checkins, today()] }
          : x,
      ),
    }));
    setStatus(
      progress === e.target
        ? "✦ 成就解锁！又一起完成了一件美好的事。"
        : "今天的一小步，已经被好好记住。",
    );
  };
  const generateReview = () => {
    const start = new Date(today() + "T12:00:00");
    if (period === "week") start.setDate(start.getDate() - 6);
    else start.setDate(1);
    const entries = data.diary.filter(
      (e) => e.date >= start.toISOString().slice(0, 10) && e.date <= today(),
    );
    const moods: Record<string, number> = {};
    for (const e of entries) moods[e.mood] = (moods[e.mood] || 0) + 1;
    setReview(
      entries.length
        ? `这${period === "week" ? "一周" : "个月"}写下了 ${entries.length} 篇日记。\n心情印记：${Object.entries(
            moods,
          )
            .map(([m, n]) => `${m} ${n} 次`)
            .join(
              "、",
            )}。\n\n${entries.map((e) => `${e.date} · ${e.title}\n${e.body.slice(0, 120)}${e.body.length > 120 ? "…" : ""}`).join("\n\n")}\n\n这是按记录汇总的本地回顾，没有调用 AI。`
        : "这段时间还没有日记。记下一件今天的小事吧。",
    );
  };
  return (
    <>
      {kind === "story" && (
        <Notice>
          静态演示阅读锁仅在浏览器验证，公开密码为
          love-demo。正文仍存于本机，这不是安全访问控制或加密保密。
        </Notice>
      )}
      {kind === "future-mailbox" && (
        <Notice>
          本机封存模式：开启日期按此设备时间判断。正文保存在本地，不能防止查看存储或修改系统时间。真正的定时保密需要服务端存储和校验。
        </Notice>
      )}
      {kind === "diary" && (
        <div className="journal-summary">
          <div>
            <span>MOOD OF OUR DAYS</span>
            <h3>每一种心情，都可以被温柔接住。</h3>
          </div>
          <div className="mood-dots">
            {[...data.diary]
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(-14)
              .map((e) => (
                <span
                  title={`${e.date} ${e.mood}`}
                  key={e.id}
                  className={`mood-dot ${e.mood === "低落" ? "blue" : e.mood === "平静" ? "green" : "pink"}`}
                >
                  {e.mood === "开心"
                    ? "☺"
                    : e.mood === "心动"
                      ? "♡"
                      : e.mood === "低落"
                        ? "☁"
                        : "☽"}
                </span>
              ))}
            {!data.diary.length && (
              <small>写下日记后，这里会亮起心情星星</small>
            )}
          </div>
        </div>
      )}
      {kind === "universe" && (
        <div className="anniversary-sky">
          <div className="sun-center">
            <Heart size={32} />
            <span>
              {data.settings.name1} & {data.settings.name2}
            </span>
          </div>
          {[...data.universe]
            .sort((a, b) =>
              nextAnniversary(a.date).localeCompare(nextAnniversary(b.date)),
            )
            .slice(0, 6)
            .map((e, i) => (
              <button
                key={e.id}
                className={`anniversary-planet planet-${i}`}
                onClick={() => setReading(e.id)}
              >
                <span>✦</span>
                <b>{daysBetween(today(), nextAnniversary(e.date))} 天</b>
                <small>{e.title}</small>
              </button>
            ))}
          {!data.universe.length && (
            <p className="sky-hint">为重要的日子，点亮第一颗星球。</p>
          )}
        </div>
      )}
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="搜索记录"
            placeholder={`寻找一段${labels[kind]}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-options">
          {kind === "diary" && (
            <select
              aria-label="心情筛选"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              <option value="">所有心情</option>
              {["开心", "心动", "平静", "低落"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          )}
          {kind !== "story" && (
            <select
              value={sort}
              aria-label="时间排序"
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="desc">从最近开始</option>
              <option value="asc">从最初开始</option>
            </select>
          )}
          {kind === "map" && (
            <button
              className="button secondary"
              onClick={() => setView(view === "map" ? "list" : "map")}
            >
              {view === "map" ? <LayoutList size={16} /> : <Map size={16} />}{" "}
              {view === "map" ? "列表" : "地图"}
            </button>
          )}
          <button
            className="button"
            onClick={() =>
              setEdit(
                makeEntry({
                  title: "",
                  order: data[kind].length,
                  openDate: kind === "future-mailbox" ? today() : undefined,
                }),
              )
            }
          >
            <Plus size={17} /> 写下{labels[kind]}
          </button>
        </div>
      </div>
      {kind === "diary" && (
        <div className="review-actions">
          <select
            aria-label="回顾周期"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">最近七天</option>
            <option value="month">本月</option>
          </select>
          <button className="text-button" onClick={generateReview}>
            <BookOpen size={16} />
            生成时光回顾
          </button>
        </div>
      )}
      {status && (
        <p className="status" role="status">
          {status}
        </p>
      )}
      {kind === "map" && view === "map" && (
        <>
          <Notice>
            地图使用 OpenStreetMap
            在线瓦片，需要联网，遵循其服务政策；无法加载时可切换列表。新增地点请填写实际经纬度。
          </Notice>
          <MapView
            items={items}
            onSelect={(id) => setReading(id)}
            onFallback={() => setView("list")}
          />
        </>
      )}
      {!items.length ? (
        <Empty
          title={
            query || mood ? "没有找到相应记录" : "这里的第一颗星星，等你点亮"
          }
          text={
            query || mood
              ? "换一个关键词，或试试其他心情。"
              : `点击「写下${labels[kind]}」，让今天成为故事的开始。`
          }
        />
      ) : (
        <div
          className={`records-grid ${kind === "memories" ? "timeline" : ""} ${kind === "story" ? "chapter-list" : ""}`}
        >
          {items.map((e, i) => {
            const sealed =
              kind === "future-mailbox" && (e.openDate || e.date) > today();
            const locked =
              kind === "story" && e.hidden && !unlocked.includes(e.id);
            const showBody = !sealed && !locked;
            return (
              <article
                key={e.id}
                className={`record-card ${kind === "letters" ? `letter-card ${e.background}` : ""} ${sealed ? "sealed" : ""}`}
              >
                <div className="record-date">
                  <SourceBadge source={e.source} />
                  {kind === "story"
                    ? `CHAPTER ${String(i + 1).padStart(2, "0")}`
                    : e.date}
                  <span>
                    {kind === "diary"
                      ? e.mood
                      : sealed
                        ? "封存中"
                        : kind === "story" && e.hidden
                          ? "隐藏章节"
                          : "✧"}
                  </span>
                </div>
                {e.photo && showBody && (
                  <button
                    className="record-photo"
                    onClick={() => setReading(e.id)}
                  >
                    <Photo src={e.photo} alt={e.title} />
                  </button>
                )}
                {kind === "letters" && <div className="envelope-mark">✉</div>}
                {sealed && (
                  <div className="envelope-mark">
                    <LockKeyhole size={34} />
                  </div>
                )}
                <button
                  className="record-title"
                  onClick={() =>
                    kind === "memories"
                      ? router.push(recordUrl("memories", e.id))
                      : setReading(e.id)
                  }
                >
                  <h3>{e.title}</h3>
                </button>
                {showBody ? (
                  <p className="record-excerpt">
                    {e.body.slice(0, 140) || "有些喜欢，留在这一刻就很好。"}
                  </p>
                ) : (
                  <p className="record-excerpt">
                    {sealed
                      ? `寄给 ${e.recipient} · ${e.openDate} 开启`
                      : "一段只想悄悄读给你听的故事。"}
                  </p>
                )}
                {kind === "universe" && (
                  <div className="event-days">
                    <b>{daysBetween(today(), nextAnniversary(e.date))}</b>
                    <span>
                      天后，再次纪念
                      <br />
                      {nextAnniversary(e.date)}
                    </span>
                  </div>
                )}
                {kind === "growth" && (
                  <>
                    <span className="chip">{e.category}</span>
                    <div className="progress-track">
                      <i
                        style={{
                          width: `${Math.min(100, (e.progress / e.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="progress-info">
                      <span>
                        {e.progress} / {e.target} ·{" "}
                        {e.progress >= e.target ? "已达成 ♡" : "慢慢来，一起走"}
                      </span>
                      <span>连续 {streak(e.checkins)} 天</span>
                    </div>
                    <button
                      className="button secondary"
                      disabled={e.progress >= e.target}
                      onClick={() => checkin(e)}
                    >
                      <Check size={15} />
                      {e.progress >= e.target
                        ? "已完成这一段旅程"
                        : e.checkins.includes(today())
                          ? "今天已记录"
                          : "记下今天的一步"}
                    </button>
                  </>
                )}
                <div className="record-footer">
                  <button
                    className="text-button"
                    onClick={() =>
                      kind === "memories"
                        ? router.push(recordUrl("memories", e.id))
                        : setReading(e.id)
                    }
                  >
                    {sealed ? "查看封存状态" : "打开这段心意"}{" "}
                    <ArrowUp size={13} style={{ transform: "rotate(45deg)" }} />
                  </button>
                  <div className="record-tools">
                    {kind === "story" && (
                      <>
                        <button
                          className="icon-button"
                          disabled={i === 0}
                          aria-label={`上移 ${e.title}`}
                          onClick={() => move(e, -1)}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="icon-button"
                          disabled={i === items.length - 1}
                          aria-label={`下移 ${e.title}`}
                          onClick={() => move(e, 1)}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </>
                    )}
                    {!sealed && !locked && (
                      <button
                        className="icon-button"
                        aria-label={`编辑 ${e.title}`}
                        onClick={() => setEdit(e)}
                      >
                        <PenLine size={14} />
                      </button>
                    )}
                    <button
                      className="icon-button"
                      aria-label={`删除 ${e.title}`}
                      onClick={() => remove(e)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {edit && (
        <EntryEditor
          kind={kind}
          entry={edit}
          onClose={() => setEdit(null)}
          onSave={save}
        />
      )}
      {selected && (
        <Modal wide title={selected.title} onClose={closeReader}>
          {kind === "future-mailbox" &&
          (selected.openDate || selected.date) > today() ? (
            <div className="sealed-reader">
              <LockKeyhole size={48} />
              <h3>让时间，替我们保管这份心意。</h3>
              <p>寄给 {selected.recipient}</p>
              <strong>{selected.openDate} 开启</strong>
              <p>
                还需等待{" "}
                {daysBetween(today(), selected.openDate || selected.date)} 天
              </p>
            </div>
          ) : kind === "story" &&
            selected.hidden &&
            !unlocked.includes(selected.id) ? (
            <form
              className="editor"
              onSubmit={async (ev) => {
                ev.preventDefault();
                setBusy(true);
                try {
                  await unlockDemoChapter(password);
                  setUnlocked([...unlocked, selected.id]);
                  setPassword("");
                  setStatus("");
                } catch (e) {
                  setStatus((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Notice>
                GitHub Pages
                静态演示密码：love-demo。浏览器本地验证仅提供拆阅仪式感，不适用于敏感信息。
              </Notice>
              <label>
                章节密码
                <input
                  type="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="button" disabled={busy}>
                {busy ? "验证中…" : "打开隐藏章节"}
              </button>
              <p role="status">{status}</p>
            </form>
          ) : (
            <div
              className={`reader ${kind === "letters" ? selected.background : ""}`}
            >
              <div className="reader-meta">
                <SourceBadge source={selected.source} />
                <br />
                {kind !== "memories" && (
                  <Link
                    className="subtle-link"
                    href={recordUrl(kind, selected.id)}
                  >
                    独立阅读此刻的心意 ↗
                  </Link>
                )}
                <br />
                {selected.date} ·{" "}
                {kind === "letters" || kind === "future-mailbox"
                  ? `致 ${selected.recipient}`
                  : "我们的故事"}
              </div>
              {selected.photo && (
                <Photo src={selected.photo} alt={selected.title} />
              )}
              <div className={kind === "letters" ? "letter-body" : ""}>
                {selected.body || "这一刻，值得被记住。"}
              </div>
              {selected.music ? (
                <MusicPlayer key={selected.music} src={selected.music} />
              ) : kind === "letters" ? (
                <p className="reader-music-note">
                  这封信暂未设置音乐。可在编辑中填写音频地址，阅读时手动播放。
                </p>
              ) : null}
              <div className="reader-sign">With all my love ♡</div>
            </div>
          )}
        </Modal>
      )}
      {initialId && !selected && (
        <Empty
          title="这段回忆已经离开轨道"
          text="记录不存在，或已在其他标签页删除。"
        />
      )}
      {review && (
        <Modal title="我们的时光回顾" onClose={() => setReview("")}>
          <div className="reader">{review}</div>
        </Modal>
      )}
    </>
  );
}
function streak(checkins: string[]) {
  const set = new Set(checkins);
  const cursor = new Date(today() + "T12:00:00Z");
  if (!set.has(today())) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let n = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    n++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return n;
}
