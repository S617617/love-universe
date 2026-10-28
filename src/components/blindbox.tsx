"use client";
import { useState, useRef, useEffect } from "react";
import { Gift, Heart, Plus, Trash2, PenLine, Sparkles } from "lucide-react";
import { useData, makeEntry, type Entry } from "@/lib/store";
import { Modal, Empty, SourceBadge } from "./ui";
export function Blindbox() {
  const { data, update } = useData();
  const [budget, setBudget] = useState("10000");
  const [location, setLocation] = useState("不限");
  const [duration, setDuration] = useState("1440");
  const [result, setResult] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [edit, setEdit] = useState<Entry | null>(null);
  const [status, setStatus] = useState("");
  const [favs, setFavs] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const items = data.blindbox.filter((e) => !favs || e.favorite);
  const selected = data.blindbox.find((e) => e.id === result);
  const draw = () => {
    const pool = data.blindbox.filter(
      (e) =>
        e.budget <= Number(budget) &&
        e.duration <= Number(duration) &&
        (location === "不限" ||
          e.location === location ||
          e.location === "不限"),
    );
    if (!pool.length) {
      setStatus("这个条件下还没有惊喜。放宽筛选，或亲手添加一个吧。");
      return;
    }
    setStatus("");
    setDrawing(true);
    setResult(null);
    const index = crypto.getRandomValues(new Uint32Array(1))[0] % pool.length;
    timer.current = setTimeout(() => {
      setResult(pool[index].id);
      setDrawing(false);
    }, 900);
  };
  const favorite = (e: Entry) =>
    update((d) => ({
      ...d,
      blindbox: d.blindbox.map((x) =>
        x.id === e.id ? { ...x, favorite: !x.favorite } : x,
      ),
    }));
  return (
    <>
      <div className="blindbox-stage">
        <span className="eyebrow">A SMALL SURPRISE FOR US</span>
        <button
          className={`gift-art ${drawing ? "drawing" : ""}`}
          onClick={draw}
          disabled={drawing}
          aria-label="抽取惊喜"
        >
          <Gift size={100} strokeWidth={0.8} />
          <span>✦</span>
          <i>✧</i>
        </button>
        <h2>
          {drawing ? "正在收集宇宙里的小惊喜…" : "今天，心动会以什么方式出现？"}
        </h2>
        <p>约会、任务，或一句刚好说到心里的话。</p>
        <div className="blind-filters">
          <label>
            预算
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="10000">不限预算</option>
              <option value="0">零预算</option>
              <option value="50">50 元以内</option>
              <option value="100">100 元以内</option>
              <option value="300">300 元以内</option>
            </select>
          </label>
          <label>
            场景
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {["不限", "室内", "户外"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            可用时间
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1440">不限时长</option>
              <option value="30">半小时</option>
              <option value="120">两小时</option>
              <option value="240">半天</option>
            </select>
          </label>
        </div>
        <button className="button" disabled={drawing} onClick={draw}>
          <Sparkles size={17} />
          {drawing ? "惊喜正在路上…" : "拆开今天的小惊喜"}
        </button>
        {status && <p role="status">{status}</p>}
      </div>
      <div className="toolbar">
        <h2>
          我们的惊喜清单 <small>{items.length}</small>
        </h2>
        <div className="toolbar-options">
          <button className="button secondary" onClick={() => setFavs(!favs)}>
            <Heart size={15} />
            {favs ? "查看全部" : "只看收藏"}
          </button>
          <button
            className="button secondary"
            onClick={() => setEdit(makeEntry({ title: "", body: "" }))}
          >
            <Plus size={16} />
            添加惊喜
          </button>
        </div>
      </div>
      <div className="records-grid">
        {items.map((e) => (
          <article className="record-card" key={e.id}>
            <SourceBadge source={e.source} />
            <span className="chip">{e.category}</span>
            <h3>{e.title}</h3>
            <p>{e.body}</p>
            <small>
              {e.budget} 元 · {e.location} · {e.duration} 分钟
            </small>
            <div className="record-footer">
              <button
                className="icon-button"
                aria-label="收藏惊喜"
                onClick={() => favorite(e)}
              >
                <Heart size={17} fill={e.favorite ? "currentColor" : "none"} />
              </button>
              <div className="record-tools">
                <button
                  className="icon-button"
                  aria-label="编辑惊喜"
                  onClick={() => setEdit(e)}
                >
                  <PenLine size={15} />
                </button>
                <button
                  className="icon-button"
                  aria-label="删除惊喜"
                  onClick={() => {
                    if (confirm("确定删除这个惊喜吗？"))
                      update((d) => ({
                        ...d,
                        blindbox: d.blindbox.filter((x) => x.id !== e.id),
                      }));
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <Empty title="这里还没有惊喜" text="写下一个想和对方一起做的小事吧。" />
      )}
      {selected && (
        <Modal title="宇宙为你挑选的惊喜" onClose={() => setResult(null)}>
          <div className="surprise-result">
            <span>✦</span>
            <small>
              {selected.category} · {selected.budget} 元 · {selected.duration}{" "}
              分钟
            </small>
            <h2>{selected.title}</h2>
            <p>{selected.body}</p>
            <button
              className="button secondary"
              onClick={() => favorite(selected)}
            >
              <Heart
                size={17}
                fill={selected.favorite ? "currentColor" : "none"}
              />
              {selected.favorite ? "已收藏这份心动" : "收藏这份心动"}
            </button>
            <button className="text-button" onClick={draw}>
              再遇见一个惊喜
            </button>
          </div>
        </Modal>
      )}
      {edit && (
        <Modal title="亲手准备一个惊喜" onClose={() => setEdit(null)}>
          <form
            className="editor"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                update((d) => ({
                  ...d,
                  blindbox: d.blindbox.some((x) => x.id === edit.id)
                    ? d.blindbox.map((x) =>
                        x.id === edit.id
                          ? { ...edit, source: "personal" as const }
                          : x,
                      )
                    : [...d.blindbox, { ...edit, source: "personal" as const }],
                }))
              )
                setEdit(null);
            }}
          >
            <label>
              惊喜名称
              <input
                required
                maxLength={120}
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </label>
            <label>
              内容
              <textarea
                required
                rows={4}
                maxLength={20000}
                value={edit.body}
                onChange={(e) => setEdit({ ...edit, body: e.target.value })}
              />
            </label>
            <label>
              类别
              <select
                value={edit.category}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              >
                {["日常", "约会", "惊喜任务", "恋爱寄语"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                预算（元）
                <input
                  required
                  type="number"
                  min={0}
                  max={100000}
                  value={edit.budget}
                  onChange={(e) =>
                    setEdit({ ...edit, budget: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                时长（分钟）
                <input
                  required
                  type="number"
                  min={1}
                  max={1440}
                  value={edit.duration}
                  onChange={(e) =>
                    setEdit({ ...edit, duration: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label>
              场景
              <select
                value={edit.location}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    location: e.target.value as Entry["location"],
                  })
                }
              >
                {["不限", "室内", "户外"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <button className="button">收藏进惊喜清单</button>
          </form>
        </Modal>
      )}
    </>
  );
}
