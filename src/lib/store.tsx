"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { z } from "zod";
import { createDemoData } from "./demo-data";
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(s + "T12:00:00Z");
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "日期无效");
const media = z
  .string()
  .max(500)
  .refine(
    (s) =>
      !s ||
      /^asset:[a-zA-Z0-9-]+$/.test(s) ||
      /^https?:\/\//.test(s) ||
      /^\/demo\/[a-z-]+\.svg$/.test(s),
    "图片地址无效",
  );
export const recordSchema = z.object({
  source: z.enum(["demo", "personal"]).default("personal"),
  id: z.string().max(100),
  title: z.string().min(1).max(120),
  date,
  body: z.string().max(20000),
  photo: media.default(""),
  mood: z.string().max(30).default("开心"),
  order: z.number().finite().default(0),
  hidden: z.boolean().default(false),
  recipient: z.string().max(80).default("亲爱的你"),
  openDate: date.optional(),
  category: z.string().max(40).default("日常"),
  target: z.number().min(1).max(100000).default(10),
  progress: z.number().min(0).max(100000).default(0),
  checkins: z.array(date).max(10000).default([]),
  lat: z.number().min(-90).max(90).default(31.23),
  lng: z.number().min(-180).max(180).default(121.47),
  budget: z.number().min(0).max(100000).default(100),
  location: z.enum(["室内", "户外", "不限"]).default("不限"),
  duration: z.number().min(1).max(1440).default(120),
  favorite: z.boolean().default(false),
  background: z.enum(["paper", "rose", "night"]).default("paper"),
  music: z
    .string()
    .max(1000)
    .refine((s) => !s || /^https?:\/\//.test(s))
    .default(""),
});
export type Entry = z.infer<typeof recordSchema>;
const collection = z.array(recordSchema).max(5000);
export const dataSchema = z.object({
  version: z.literal(1),
  settings: z.object({
    name1: z.string().min(1).max(30),
    name2: z.string().min(1).max(30),
    avatar1: media,
    avatar2: media,
    met: date,
    start: date,
    message: z.string().max(200),
    theme: z.enum(["starlight", "rose"]),
    background: z.enum(["stars", "aurora"]),
    onboarded: z.boolean(),
    demoProfile: z.boolean().default(false),
  }),
  memories: collection,
  story: collection,
  diary: collection,
  letters: collection,
  universe: collection,
  growth: collection,
  "future-mailbox": collection,
  map: collection,
  blindbox: collection,
  garden: z.object({
    flowers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().max(80),
          xp: z.number().min(0).max(1000),
          wish: z.string().max(500),
          watered: date.optional(),
          fed: date.optional(),
        }),
      )
      .max(60),
    points: z.number().min(0).max(100000),
    tasks: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().min(1).max(100),
          done: z.boolean(),
        }),
      )
      .max(500),
  }),
  chat: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string().max(20000),
        demo: z.boolean().optional(),
      }),
    )
    .max(500),
});
export type Data = z.infer<typeof dataSchema>;
export type CollectionKey =
  | "memories"
  | "story"
  | "diary"
  | "letters"
  | "universe"
  | "growth"
  | "future-mailbox"
  | "map"
  | "blindbox";
export function makeEntry(values: Partial<Entry> = {}): Entry {
  const draft = recordSchema.parse({
    id: crypto.randomUUID(),
    date: today(),
    body: "",
    ...values,
    title: values.title || "未命名的心动",
  });
  // Empty titles are valid while editing; persistence still uses the strict schema.
  return { ...draft, title: values.title ?? draft.title };
}
export function emptyData(): Data {
  return {
    version: 1,
    settings: {
      name1: "亲爱的我",
      name2: "亲爱的你",
      avatar1: "",
      avatar2: "",
      met: today(),
      start: today(),
      message: "宇宙很大，幸好我们找到了彼此。",
      theme: "starlight",
      background: "stars",
      onboarded: false,
      demoProfile: false,
    },
    memories: [],
    story: [],
    diary: [],
    letters: [],
    universe: [],
    growth: [],
    "future-mailbox": [],
    map: [],
    blindbox: [
      {
        title: "一起去看日落",
        body: "带两杯喜欢的饮料，找一个开阔的地方，安静地等天空变成粉色。",
        budget: 30,
        location: "户外",
        duration: 90,
      },
      {
        title: "交换一份歌单",
        body: "各选三首歌，告诉对方为什么想起了彼此。",
        budget: 0,
        location: "室内",
        duration: 30,
      },
      {
        title: "双人厨房约会",
        body: "一起买菜，尝试一道从没做过的料理，给今晚的餐厅起个名字。",
        budget: 100,
        location: "室内",
        duration: 120,
      },
      {
        title: "给彼此画肖像",
        body: "用十分钟画出眼中的对方，把作品签名收藏。",
        budget: 10,
        location: "室内",
        duration: 30,
      },
      {
        title: "城市漫游",
        body: "选一个没去过的街区，用相机收集五个让你们微笑的画面。",
        budget: 80,
        location: "户外",
        duration: 180,
      },
    ].map((e, i) =>
      recordSchema.parse({
        id: `seed-${i}`,
        source: "demo",
        date: today(),
        ...e,
      }),
    ),
    garden: { flowers: [], points: 20, tasks: [] },
    chat: [],
  };
}
export function demoData(): Data {
  return dataSchema.parse(createDemoData(emptyData(), makeEntry));
}
const KEY = "love-universe:v1";
export function parseBackup(text: string): Data {
  if (text.length > 12_000_000) throw Error("备份超过 12MB 限制");
  return dataSchema.parse(JSON.parse(text));
}
export function saveData(data: Data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
const Context = createContext<{
  data: Data;
  ready: boolean;
  error: string;
  update: (fn: (d: Data) => Data) => boolean;
  replace: (d: Data) => boolean;
  clearError: () => void;
} | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(emptyData);
  const dataRef = useRef(data);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const loaded = parseBackup(raw);
        dataRef.current = loaded;
        setData(loaded);
      } else {
        const initial = demoData();
        dataRef.current = initial;
        setData(initial);
        try {
          saveData(initial);
        } catch {
          setError(
            "浏览器无法保存数据，目前为临时演示；刷新或关闭后可能丢失更改。",
          );
        }
      }
    } catch {
      setError(
        "本地数据无法读取。原始数据未覆盖，请先在设置中导出原始备份，再导入有效备份恢复。",
      );
    }
    setReady(true);
  }, []);
  const replace = useCallback((d: Data) => {
    try {
      const valid = dataSchema.parse(d);
      saveData(valid);
      dataRef.current = valid;
      setData(valid);
      return true;
    } catch {
      setError("保存失败：可能存储空间不足或数据格式不正确。请先导出备份。");
      return false;
    }
  }, []);
  const update = (fn: (d: Data) => Data) => replace(fn(dataRef.current));
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          const incoming = parseBackup(e.newValue);
          dataRef.current = incoming;
          setData(incoming);
        } catch {
          setError("其他标签页写入了无法识别的数据。");
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <Context.Provider
      value={{
        data,
        ready,
        error,
        update,
        replace,
        clearError: () => setError(""),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useData() {
  const c = useContext(Context);
  if (!c) throw Error("Provider missing");
  return c;
}
export function daysBetween(a: string, b = today()) {
  return Math.floor(
    (Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000,
  );
}
export function nextAnniversary(date: string) {
  const now = today();
  const year = Number(now.slice(0, 4));
  const original = Number(date.slice(0, 4));
  if (original > year) return date;
  const next = (y: number) => {
    const month = Number(date.slice(5, 7)),
      day = Number(date.slice(8, 10));
    const max = new Date(y, month, 0).getDate();
    return `${y}-${String(month).padStart(2, "0")}-${String(Math.min(day, max)).padStart(2, "0")}`;
  };
  const current = next(year);
  return current >= now ? current : next(year + 1);
}
