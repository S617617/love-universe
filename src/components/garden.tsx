"use client";
import { useState } from "react";
import { Droplets, Sparkles, Plus, Check, Trash2, Flower2 } from "lucide-react";
import { useData, today } from "@/lib/store";
import { Modal, Empty, SourceBadge } from "./ui";
export function Garden() {
  const { data, update } = useData();
  const g = data.garden;
  const [plant, setPlant] = useState(false);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [task, setTask] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const flower = g.flowers.find((f) => f.id === selected);
  const tend = (id: string, type: "water" | "feed") => {
    const f = g.flowers.find((f) => f.id === id)!;
    const key = type === "water" ? "watered" : "fed";
    if (f[key] === today()) {
      setStatus("今天已经照顾过啦，让它慢慢长大吧。");
      return;
    }
    if (type === "feed" && g.points < 5) {
      setStatus("完成一个温柔的小任务，就能获得养分。");
      return;
    }
    if (
      update((d) => ({
        ...d,
        garden: {
          ...d.garden,
          points: d.garden.points - (type === "feed" ? 5 : 0),
          flowers: d.garden.flowers.map((f) =>
            f.id === id
              ? {
                  ...f,
                  xp: Math.min(100, f.xp + (type === "water" ? 10 : 20)),
                  [key]: today(),
                }
              : f,
          ),
        },
      }))
    )
      setStatus(
        type === "water"
          ? "清水和心意，都已送达。"
          : "玫瑰收到了你的温柔养分。",
      );
  };
  return (
    <>
      <div className="garden-banner">
        <span>☽</span>
        <h2>爱是每天，一点点的照顾。</h2>
        <p>种下心愿，浇一点水。让每一件小事，都开出一朵花。</p>
        <div className="garden-stats">
          <span>
            <Flower2 size={17} />
            {g.flowers.length} 株玫瑰
          </span>
          <span>
            <Sparkles size={17} />
            {g.points} 点温柔养分
          </span>
        </div>
      </div>
      <div className="toolbar">
        <h2>我们的秘密花园</h2>
        <button
          className="button"
          disabled={g.flowers.length >= 60}
          onClick={() => setPlant(true)}
        >
          <Plus size={16} />
          种下一朵玫瑰 · 10 养分
        </button>
      </div>
      {status && (
        <p className="status" role="status">
          {status}
        </p>
      )}
      <div className="garden-bed">
        {g.flowers.map((f) => (
          <button
            className={`flower-pot stage-${f.xp < 30 ? 0 : f.xp < 70 ? 1 : 2}`}
            key={f.id}
            onClick={() => setSelected(f.id)}
          >
            <div className="flower-art">
              <span className="rose-bloom">
                {f.xp < 30 ? "❧" : f.xp < 70 ? "❀" : "✿"}
              </span>
              <i className="stem" />
              <i className="leaf left" />
              <i className="leaf right" />
              <i className="soil" />
            </div>
            <b>{f.name}</b>
            <SourceBadge
              source={f.id.startsWith("demo-") ? "demo" : "personal"}
            />
            <small>
              {f.xp < 30 ? "嫩芽" : f.xp < 70 ? "含苞" : "盛放"} · {f.xp}%
            </small>
          </button>
        ))}
        {!g.flowers.length && (
          <Empty
            symbol="❀"
            title="花园还在等第一朵玫瑰"
            text="你有 20 点初始养分。种下心愿，陪它慢慢长大。"
          />
        )}
      </div>
      <section className="settings-panel garden-tasks">
        <h2>把温柔变成日常</h2>
        <p>约好一件小事，完成后收获 10 点养分。每个任务只奖励一次。</p>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!task.trim()) return;
            update((d) => ({
              ...d,
              garden: {
                ...d.garden,
                tasks: [
                  ...d.garden.tasks,
                  { id: crypto.randomUUID(), title: task.trim(), done: false },
                ],
              },
            }));
            setTask("");
          }}
        >
          <input
            required
            maxLength={100}
            placeholder="例如：今天认真听对方分享一天"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button className="button secondary">
            <Plus size={17} />
            添加约定
          </button>
        </form>
        {g.tasks.map((t) => (
          <div className="garden-task" key={t.id}>
            <button
              className={`task-check ${t.done ? "done" : ""}`}
              aria-label={`完成 ${t.title}`}
              disabled={t.done}
              onClick={() =>
                update((d) => ({
                  ...d,
                  garden: {
                    ...d.garden,
                    points: d.garden.points + 10,
                    tasks: d.garden.tasks.map((x) =>
                      x.id === t.id ? { ...x, done: true } : x,
                    ),
                  },
                }))
              }
            >
              <Check size={16} />
            </button>
            <span className={t.done ? "done" : ""}>
              {t.title}{" "}
              {t.id.startsWith("demo-") && <SourceBadge source="demo" />}
            </span>
            <small>{t.done ? "温柔已收集" : "+10 养分"}</small>
            <button
              className="icon-button"
              aria-label="删除任务"
              onClick={() => {
                if (confirm("删除这个约定吗？"))
                  update((d) => ({
                    ...d,
                    garden: {
                      ...d.garden,
                      tasks: d.garden.tasks.filter((x) => x.id !== t.id),
                    },
                  }));
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </section>
      {plant && (
        <Modal title="种下一个小心愿" onClose={() => setPlant(false)}>
          <form
            className="editor"
            onSubmit={(e) => {
              e.preventDefault();
              if (g.points < 10) {
                setStatus("养分还不够，完成一个小任务再来吧。");
                setPlant(false);
                return;
              }
              if (
                update((d) => ({
                  ...d,
                  garden: {
                    ...d.garden,
                    points: d.garden.points - 10,
                    flowers: [
                      ...d.garden.flowers,
                      {
                        id: crypto.randomUUID(),
                        name: name.trim(),
                        wish,
                        xp: 0,
                      },
                    ],
                  },
                }))
              ) {
                setPlant(false);
                setName("");
                setWish("");
              }
            }}
          >
            <label>
              玫瑰的名字
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：第一次牵手"
              />
            </label>
            <label>
              藏在花里的回忆或祝福
              <textarea
                maxLength={500}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                rows={4}
              />
            </label>
            <button className="button">把爱种下</button>
          </form>
        </Modal>
      )}
      {flower && (
        <Modal title={flower.name} onClose={() => setSelected(null)}>
          <div className="flower-detail">
            <span className="large-flower">{flower.xp < 30 ? "❧" : "✿"}</span>
            <p>{flower.wish || "愿我们的日子，慢慢开花。"}</p>
            <div className="progress-track">
              <i style={{ width: `${flower.xp}%` }} />
            </div>
            <p>成长值 {flower.xp} / 100</p>
            <div className="form-actions">
              <button
                className="button secondary"
                disabled={flower.watered === today() || flower.xp >= 100}
                onClick={() => tend(flower.id, "water")}
              >
                <Droplets size={16} />
                浇水 +10
              </button>
              <button
                className="button"
                disabled={
                  flower.fed === today() || flower.xp >= 100 || g.points < 5
                }
                onClick={() => tend(flower.id, "feed")}
              >
                <Sparkles size={16} />
                施肥 +20 · 5 养分
              </button>
            </div>
            {flower.xp >= 100 && (
              <p>✦ 一朵玫瑰，为你们盛放。继续种下下一份心愿吧。</p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
