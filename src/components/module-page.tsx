"use client";
import { modules } from "@/lib/catalog";
import { Records } from "./records";
import { SettingsPage } from "./settings";
import { Garden } from "./garden";
import { Blindbox } from "./blindbox";
import { Assistant } from "./assistant";
import { useData } from "@/lib/store";
export function ModulePage({ id }: { id: string }) {
  const { ready } = useData();
  if (!ready) return null;
  if (id === "settings") return <SettingsPage />;
  const m = modules.find((m) => m.id === id)!;
  return (
    <div className={`container module-page page-${id}`}>
      <header className="page-title">
        <span className={`page-emblem ${m.color}`}>
          <m.icon size={28} strokeWidth={1.4} />
        </span>
        <div className="eyebrow">{m.en}</div>
        <h1>{m.name}</h1>
        <p>{m.desc}</p>
      </header>
      {id === "garden" ? (
        <Garden />
      ) : id === "blindbox" ? (
        <Blindbox />
      ) : id === "assistant" ? (
        <Assistant />
      ) : (
        <Records kind={id as Parameters<typeof Records>[0]["kind"]} />
      )}
    </div>
  );
}
