"use client";
import { useState } from "react";
import Link from "next/link";
import { Settings, Save, Download, Upload, Trash2, Heart } from "lucide-react";
import {
  useData,
  emptyData,
  demoData,
  parseBackup,
  dataSchema,
  type Data,
} from "@/lib/store";
import { PhotoInput, Notice } from "./ui";
import { exportPhotos, importPhotos, clearPhotos } from "@/lib/media";
export function SettingsPage() {
  const { data, update, replace } = useData();
  const [s, setS] = useState(data.settings);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const patch = (v: Partial<Data["settings"]>) => setS({ ...s, ...v });
  const download = (text: string, name: string) => {
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="container module-page settings-page">
      <header className="page-title">
        <span className="page-emblem purple">
          <Settings size={27} />
        </span>
        <div className="eyebrow">MAKE IT OURS</div>
        <h1>设置我们的宇宙</h1>
        <p>关于我们的小事，由我们自己定义。</p>
      </header>
      <div className="settings-layout">
        <form
          className="settings-panel editor"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              update((d) => ({
                ...d,
                settings: {
                  ...s,
                  name1: s.name1.trim(),
                  name2: s.name2.trim(),
                  onboarded: true,
                  demoProfile: false,
                },
              }))
            )
              setMessage("设置已保存，首页已经换上你们的名字。");
          }}
        >
          <h2>
            <Heart size={19} /> 关于我们
          </h2>
          <div className="form-row">
            <label>
              你的名字
              <input
                required
                value={s.name1}
                maxLength={30}
                onChange={(e) => patch({ name1: e.target.value })}
              />
            </label>
            <label>
              TA 的名字
              <input
                required
                value={s.name2}
                maxLength={30}
                onChange={(e) => patch({ name2: e.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <div>
              <label>你的头像</label>
              <PhotoInput
                value={s.avatar1}
                onChange={(avatar1) => patch({ avatar1 })}
              />
            </div>
            <div>
              <label>TA 的头像</label>
              <PhotoInput
                value={s.avatar2}
                onChange={(avatar2) => patch({ avatar2 })}
              />
            </div>
          </div>
          <div className="form-row">
            <label>
              初次相识
              <input
                required
                type="date"
                value={s.met}
                onChange={(e) => patch({ met: e.target.value })}
              />
            </label>
            <label>
              开始相恋
              <input
                required
                type="date"
                value={s.start}
                onChange={(e) => patch({ start: e.target.value })}
              />
            </label>
          </div>
          <label>
            首页寄语
            <textarea
              maxLength={200}
              rows={3}
              value={s.message}
              onChange={(e) => patch({ message: e.target.value })}
            />
          </label>
          <h2>让空间像我们</h2>
          <div className="form-row">
            <label>
              主题
              <select
                value={s.theme}
                onChange={(e) =>
                  patch({ theme: e.target.value as Data["settings"]["theme"] })
                }
              >
                <option value="starlight">深邃星空</option>
                <option value="rose">暮色玫瑰</option>
              </select>
            </label>
            <label>
              背景
              <select
                value={s.background}
                onChange={(e) =>
                  patch({
                    background: e.target
                      .value as Data["settings"]["background"],
                  })
                }
              >
                <option value="stars">安静星辰</option>
                <option value="aurora">梦幻极光</option>
              </select>
            </label>
          </div>
          <Link className="subtle-link" href="/universe">
            管理我们所有的纪念日 ↗
          </Link>
          <button className="button">
            <Save size={16} />
            保存这份专属
          </button>
        </form>
        <aside>
          <div className="settings-panel demo-reset-panel" id="demo-reset">
            <small>START A LITTLE LOVE STORY</small>
            <h2>一键回到初见</h2>
            <p>
              使用虚构角色「林间与星禾」的示例回忆、日记、情书、地图和任务体验全部功能。示例带有独立标识，编辑并保存后会成为「我的记录」。
            </p>
            <p>
              恢复会替换此浏览器中的全部文字记录和聊天。请先导出需要保留的备份；上传照片文件会保留在本机，直到你主动清空全部数据。
            </p>
            <button
              className="button"
              disabled={busy}
              onClick={() => {
                if (
                  !confirm(
                    "恢复演示数据会替换当前浏览器的全部记录和聊天。请先导出备份，确定恢复吗？",
                  )
                )
                  return;
                const fresh = demoData();
                if (replace(fresh)) {
                  setS(fresh.settings);
                  setMessage("演示数据已恢复，虚构角色的宇宙重新点亮了。");
                }
              }}
            >
              恢复演示数据
            </button>
            <Link className="subtle-link" href="/">
              回首页体验 ↗
            </Link>
          </div>
          <div className="settings-panel">
            <h2>好好保管我们的故事</h2>
            <Notice>
              当前为本地单设备版本。localStorage 与 IndexedDB
              不会云端同步，也不提供真正的安全访问控制。清除浏览器数据会丢失记录，请定期备份。
            </Notice>
            <p>
              完整备份包含照片，导入时会替换当前全部文字记录。仅导入可信备份，单个备份最大
              60MB。
            </p>
            <div className="backup-buttons">
              <button
                className="button secondary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    download(
                      JSON.stringify({ data, photos: await exportPhotos() }),
                      `love-universe-${new Date().toISOString().slice(0, 10)}.json`,
                    );
                    setMessage("完整备份已导出，包含本机照片。");
                  } catch {
                    setMessage("照片备份失败，可先导出文字备份。");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Download size={16} />
                导出完整备份
              </button>
              <button
                className="text-button"
                onClick={() =>
                  download(JSON.stringify(data), "love-universe-text.json")
                }
              >
                仅导出文字
              </button>
              <button
                className="text-button"
                onClick={() =>
                  download(
                    localStorage.getItem("love-universe:v1") || "{}",
                    "love-universe-raw.json",
                  )
                }
              >
                导出原始存储（故障恢复）
              </button>
              <label
                className="button secondary"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.currentTarget
                      .querySelector<HTMLInputElement>("input")
                      ?.click();
                  }
                }}
              >
                <Upload size={16} />
                {busy ? "正在处理…" : "导入 JSON 备份"}
                <input
                  type="file"
                  hidden
                  disabled={busy}
                  accept=".json,application/json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      if (file.size > 60 * 1024 * 1024)
                        throw Error("备份超过 60MB 限制");
                      const raw = JSON.parse(await file.text());
                      const incoming = raw.data
                        ? dataSchema.parse(raw.data)
                        : parseBackup(JSON.stringify(raw));
                      const photos: unknown = raw.photos || {};
                      if (
                        typeof photos !== "object" ||
                        photos === null ||
                        Array.isArray(photos) ||
                        !Object.values(photos).every(
                          (v) => typeof v === "string",
                        )
                      )
                        throw Error("图片备份格式不正确");
                      if (
                        !confirm(
                          "导入会替换当前所有记录。请先导出备份，确定继续吗？",
                        )
                      )
                        return;
                      await importPhotos(photos as Record<string, string>);
                      if (replace(incoming)) {
                        setS(incoming.settings);
                        setMessage("备份已恢复，欢迎回到熟悉的宇宙。");
                      }
                    } catch {
                      setMessage(
                        "导入失败：文件格式、版本、图片或存储空间不符合要求，原有文字记录已保留。",
                      );
                    } finally {
                      setBusy(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="settings-panel danger-panel">
            <h2>重新开始</h2>
            <p>清空将删除此浏览器内的全部记录、照片和聊天。请先导出备份。</p>
            <button
              className="button danger"
              onClick={async () => {
                if (!confirm("确定清空这个宇宙的全部记录吗？")) return;
                if (
                  prompt("此操作无法撤销。请输入「清空」再次确认：") !== "清空"
                )
                  return;
                try {
                  await clearPhotos();
                  const fresh = emptyData();
                  if (replace(fresh)) {
                    setS(fresh.settings);
                    setMessage("记录已清空，可以重新开始了。");
                  }
                } catch {
                  setMessage("照片清理失败，未清空文字记录，请重试。");
                }
              }}
            >
              <Trash2 size={16} />
              清空全部数据
            </button>
          </div>
          <div className="settings-panel">
            <small>LOVE UNIVERSE · v1.2.0 GITHUB PAGES</small>
            <p>
              为两个人的日常而作。地图需要联网；AI
              仅在浏览器内规则演示。GitHub Pages 不运行后端，真实模型需要另行部署安全服务。未来可通过独立的数据访问层接入
              Supabase 认证、数据库与私有照片存储。
            </p>
          </div>
        </aside>
      </div>
      {message && (
        <div className="toast" role="status">
          <CheckIcon />
          {message}
          <button onClick={() => setMessage("")} aria-label="关闭提示">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
function CheckIcon() {
  return <span>✦</span>;
}
