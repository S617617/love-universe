"use client";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { assetUrl } from "@/lib/paths";
import { loadPhoto, storePhoto } from "@/lib/media";
export function Photo({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let object = "";
    setFailed(false);
    setUrl("");
    if (src.startsWith("asset:")) {
      loadPhoto(src)
        .then((b) => {
          if (b && active) {
            object = URL.createObjectURL(b);
            setUrl(object);
          }
        })
        .catch(() => setFailed(true));
    } else setUrl(assetUrl(src));
    return () => {
      active = false;
      if (object) URL.revokeObjectURL(object);
    };
  }, [src]);
  return url && !failed ? (
    <img
      className={className}
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={`photo-fallback ${className}`} role="img" aria-label={alt}>
      <ImageIcon size={24} />
    </span>
  );
}
export function PhotoInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="photo-input">
      {value && <Photo src={value} alt="所选照片" />}
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
        {busy ? "正在处理…" : "上传照片"}
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            setError("");
            try {
              onChange(await storePhoto(f));
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          className="text-button"
          onClick={() => onChange("")}
        >
          移除照片
        </button>
      )}
      <small>JPG / PNG / WebP · 最大 5MB · 自动压缩</small>
      {error && (
        <span role="alert" className="error">
          {error}
        </span>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const prevent = () => closeRef.current();
    dialog?.addEventListener("cancel", prevent);
    return () => {
      dialog?.removeEventListener("cancel", prevent);
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={wide ? "modal wide" : "modal"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="关闭" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Empty({
  symbol = "✧",
  title = "故事，等你来写",
  text = "从一个小小的瞬间开始，把属于你们的回忆留在这里。",
}: {
  symbol?: string;
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <span>{symbol}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>;
}

export function SourceBadge({ source }: { source: "demo" | "personal" }) {
  return (
    <span className={`source-badge source-${source}`}>
      {source === "demo" ? "示例记录" : "我的记录"}
    </span>
  );
}
export function MusicPlayer({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="audio-player">
      <audio
        controls
        src={src}
        preload="none"
        onError={() => setFailed(true)}
        onCanPlay={() => setFailed(false)}
      />
      <small role="status">
        {failed
          ? "这段音乐暂时无法加载，可以继续阅读，或在编辑中更换可用的音频地址。"
          : "手动播放这段旋律；音乐来自你提供的外部地址。"}
      </small>
    </div>
  );
}
