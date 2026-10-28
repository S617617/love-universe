"use client";
import { requestDemoAI, type DemoAction } from "@/lib/demo-services";
import { useState } from "react";
import { Sparkles, Heart } from "lucide-react";
import type { Entry, CollectionKey } from "@/lib/store";
import { labels } from "@/lib/record-labels";
import { Modal, PhotoInput } from "./ui";
export function EntryEditor({
  kind,
  entry,
  onClose,
  onSave,
}: {
  kind: CollectionKey;
  entry: Entry;
  onClose: () => void;
  onSave: (e: Entry) => void;
}) {
  const [e, setE] = useState(entry);
  const [aiStatus, setAiStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [aiAction, setAiAction] = useState("");
  const patch = (v: Partial<Entry>) => setE({ ...e, ...v });
  const askAI = async (action: string) => {
    if (!e.body.trim()) {
      setAiStatus("先写下一些内容，再让 AI 帮忙吧。");
      return;
    }
    setBusy(true);
    setAiStatus("");
    setAiAction(action);
    try {
      const result = await requestDemoAI({
        action: action as DemoAction,
        text: e.body,
      });
      setAiDraft(result.text);
      setAiStatus(
        result.demo
          ? "公共演示模式 · 以下内容由本地规则生成，未调用真实模型"
          : "AI 已生成，请检查后再采用。",
      );
    } catch (err) {
      setAiStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal wide title={`写下${labels[kind]}`} onClose={onClose}>
      <form
        className="editor"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!e.title.trim()) {
            setAiStatus("请给这段心意起一个名字。");
            return;
          }
          if (kind === "growth" && e.target < e.progress) {
            setAiStatus("目标次数不能小于已记录的进度。");
            return;
          }
          onSave({ ...e, title: e.title.trim() });
        }}
      >
        <label>
          标题
          <input
            autoFocus
            required
            maxLength={120}
            value={e.title}
            onChange={(ev) => patch({ title: ev.target.value })}
            placeholder="给这个瞬间起个名字"
          />
        </label>
        <div className="form-row">
          <label>
            {kind === "growth" ? "开始日期" : "日期"}
            <input
              type="date"
              value={e.date}
              required
              onChange={(ev) => patch({ date: ev.target.value })}
            />
          </label>
          {kind === "diary" && (
            <label>
              今天的心情
              <select
                value={e.mood}
                onChange={(ev) => patch({ mood: ev.target.value })}
              >
                {["开心", "心动", "平静", "低落"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          )}
          {(kind === "future-mailbox" || kind === "growth") && (
            <label>
              {kind === "growth" ? "目标日期" : "开启日期"}
              <input
                type="date"
                required
                min={e.date}
                value={e.openDate || e.date}
                onChange={(ev) => patch({ openDate: ev.target.value })}
              />
            </label>
          )}
        </div>
        {(kind === "letters" || kind === "future-mailbox") && (
          <label>
            收件人
            <input
              required
              maxLength={80}
              value={e.recipient}
              onChange={(ev) => patch({ recipient: ev.target.value })}
            />
          </label>
        )}
        <label>
          {kind === "growth" ? "完成条件与我们的约定" : "想记下的话"}
          <textarea
            rows={7}
            value={e.body}
            maxLength={20000}
            onChange={(ev) => patch({ body: ev.target.value })}
            placeholder="慢慢写，不必完美。这里的每一个字，都有意义。"
          />
        </label>
        {kind === "diary" && (
          <div className="ai-writing">
            <span>
              <Sparkles size={15} /> AI 写作帮手
            </span>
            {["润色", "摘要", "标题"].map((a) => (
              <button
                key={a}
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => askAI(a)}
              >
                {a}
              </button>
            ))}
            <small>
              静态部署：只在当前浏览器按规则演示，不上传正文，也不调用真实模型。
            </small>
            {busy && <p role="status">正在整理这份心情…</p>}
            {aiStatus && <p role="status">{aiStatus}</p>}
            {aiDraft && (
              <div className="ai-draft">
                <p>{aiDraft}</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    patch(
                      aiAction === "标题"
                        ? { title: aiDraft.slice(0, 120) }
                        : { body: aiDraft },
                    );
                    setAiDraft("");
                  }}
                >
                  采用这份{aiAction}
                </button>
              </div>
            )}
          </div>
        )}
        {kind === "map" && (
          <div className="form-row">
            <label>
              纬度（-90 至 90）
              <input
                type="number"
                required
                step="any"
                min="-90"
                max="90"
                value={e.lat}
                onChange={(ev) => patch({ lat: Number(ev.target.value) })}
              />
            </label>
            <label>
              经度（-180 至 180）
              <input
                type="number"
                required
                step="any"
                min="-180"
                max="180"
                value={e.lng}
                onChange={(ev) => patch({ lng: Number(ev.target.value) })}
              />
            </label>
          </div>
        )}
        {kind === "growth" && (
          <div className="form-row">
            <label>
              目标次数
              <input
                type="number"
                required
                min={Math.max(1, e.progress)}
                max={100000}
                value={e.target}
                onChange={(ev) => patch({ target: Number(ev.target.value) })}
              />
            </label>
            <label>
              分类
              <input
                value={e.category}
                maxLength={40}
                onChange={(ev) => patch({ category: ev.target.value })}
                list="categories"
              />
              <datalist id="categories">
                {["阅读", "运动", "学习", "旅行", "日常"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </datalist>
            </label>
          </div>
        )}
        {kind === "story" && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={e.hidden}
              onChange={(ev) => patch({ hidden: ev.target.checked })}
            />
            设为隐藏章节（本机阅读锁）
          </label>
        )}
        {kind === "letters" && (
          <>
            <label>
              信纸风格
              <select
                value={e.background}
                onChange={(ev) =>
                  patch({ background: ev.target.value as Entry["background"] })
                }
              >
                <option value="paper">奶油信纸</option>
                <option value="rose">玫瑰信笺</option>
                <option value="night">星夜来信</option>
              </select>
            </label>
            <label>
              背景音乐地址（可选，HTTPS 音频）
              <input
                type="url"
                value={e.music}
                onChange={(ev) => patch({ music: ev.target.value })}
                placeholder="https://…/music.mp3"
              />
            </label>
            <small>
              需提供可公开访问的音频。阅读时手动播放，受浏览器及资源服务限制。
            </small>
          </>
        )}
        {kind !== "growth" && (
          <PhotoInput value={e.photo} onChange={(photo) => patch({ photo })} />
        )}
        {aiStatus && kind !== "diary" && (
          <p role="alert" className="error">
            {aiStatus}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            取消
          </button>
          <button className="button" type="submit">
            <Heart size={16} />
            好好收藏
          </button>
        </div>
      </form>
    </Modal>
  );
}
