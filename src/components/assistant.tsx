"use client";
import { requestDemoAI } from "@/lib/demo-services";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, Heart } from "lucide-react";
import { useData } from "@/lib/store";
import { Notice } from "./ui";
const prompts = [
  "周末想要一次轻松的约会",
  "有什么零预算的小惊喜？",
  "帮我想一个纪念日创意",
  "怎样认真表达对方对我的重要？",
];
export function Assistant() {
  const { data, update } = useData();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [data.chat.length, busy]);
  const send = async (value = text) => {
    const content = value.trim();
    if (!content || busy) return;
    setError("");
    const history = [
      ...data.chat,
      { id: crypto.randomUUID(), role: "user" as const, content },
    ].slice(-100);
    if (!update((d) => ({ ...d, chat: history }))) return;
    setText("");
    setBusy(true);
    try {
      const result = await requestDemoAI({
        action: "chat",
        messages: history
          .slice(-16)
          .map(({ role, content }) => ({ role, content })),
      });
      if (mounted.current)
        update((d) => ({
          ...d,
          chat: [
            ...history,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: result.text,
              demo: result.demo,
            },
          ],
        }));
    } catch (err) {
      if (mounted.current) {
        setError((err as Error).message);
        setText(content);
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <div className="assistant-layout">
      <aside className="settings-panel">
        <span className="assistant-orb">
          <Sparkles size={35} />
        </span>
        <h2>一起想一些美好的事</h2>
        <p>告诉我你的想法，我们把平凡的一天变得特别一点。</p>
        <Notice>
          GitHub Pages
          是无后端的静态站点。这里在浏览器内提供规则演示，不调用真实
          AI、不发送聊天或偏好到服务器。
        </Notice>
        <label className="field-label">
          主动告诉我的偏好
          <textarea
            maxLength={1000}
            rows={3}
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="例如：喜欢安静，预算 100 元以内"
          />
        </label>
        <small>
          当前偏好仅作为本机备忘，规则演示不会据此做个性化分析，也不会自动读取日记、回忆或情书。真实
          AI 需要另行部署有密钥保护的后端。
        </small>
        <button
          className="button secondary"
          disabled={busy || !data.chat.length}
          onClick={() => {
            if (confirm("确定清空全部聊天记录吗？"))
              update((d) => ({ ...d, chat: [] }));
          }}
        >
          <Trash2 size={15} />
          清空聊天记录
        </button>
      </aside>
      <section className="chat-panel">
        <div className="chat-header">
          <span className="online-dot" />
          我们的灵感搭子<small>LOVE COMPANION</small>
        </div>
        {data.chat.length > 0 && (
          <div className="chat-shortcuts" aria-label="常用问题">
            {prompts.slice(0, 3).map((prompt) => (
              <button key={prompt} disabled={busy} onClick={() => send(prompt)}>
                {prompt} ↗
              </button>
            ))}
          </div>
        )}
        <div className="chat-messages" aria-live="polite">
          {!data.chat.length && (
            <div className="chat-welcome">
              <Heart size={28} />
              <h2>下一次心动，从一个想法开始。</h2>
              <p>你想一起去哪里，或为 TA 做些什么？</p>
              <div className="quick-prompts">
                {prompts.map((p) => (
                  <button key={p} onClick={() => send(p)}>
                    {p} ↗
                  </button>
                ))}
              </div>
            </div>
          )}
          {data.chat.map((m) => (
            <div key={m.id} className={`chat-message ${m.role}`}>
              <small>
                {m.role === "user" ? "你" : "灵感搭子"}
                {m.demo ? " · 演示模式" : ""}
                {m.id.startsWith("demo-") ? " · 示例对话" : ""}
              </small>
              <p>{m.content}</p>
            </div>
          ))}
          {busy && (
            <div className="chat-message assistant">
              <p className="thinking">
                正在认真想一想<span>…</span>
              </p>
            </div>
          )}
          <div ref={bottom} />
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <form
          className="chat-compose"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            aria-label="聊天内容"
            required
            maxLength={4000}
            rows={2}
            placeholder="说说你的想法…"
            value={text}
            disabled={busy}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            className="button"
            aria-label="发送消息"
            disabled={busy || !text.trim()}
          >
            <Send size={19} />
          </button>
        </form>
      </section>
    </div>
  );
}
