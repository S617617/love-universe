"use client";
import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/lib/store";
import "leaflet/dist/leaflet.css";
export default function MapView({
  items,
  onSelect,
  onFallback,
}: {
  items: Entry[];
  onSelect: (id: string) => void;
  onFallback: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onSelect);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    setFailed(false);
    import("leaflet")
      .then((L) => {
        if (disposed || !ref.current) return;
        map = L.map(ref.current).setView(
          items.length ? [items[0].lat, items[0].lng] : [31.23, 121.47],
          items.length ? 6 : 4,
        );
        const tiles = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          },
        ).addTo(map);
        tiles.on("tileerror", () => {
          if (!disposed) setFailed(true);
        });
        for (const e of items) {
          const marker = L.marker([e.lat, e.lng], {
            icon: L.divIcon({
              className: "love-marker",
              html: "<span>♡</span>",
              iconSize: [34, 34],
              iconAnchor: [17, 34],
            }),
          });
          const label = document.createElement("span");
          label.textContent = `${e.source === "demo" ? "示例 · " : ""}${e.title}`;
          marker.addTo(map).bindTooltip(label);
          marker.getElement()?.setAttribute("aria-label", e.title);
          marker.on("click", () => callback.current(e.id));
        }
        if (items.length > 1)
          map.fitBounds(
            L.latLngBounds(
              items.map((e) => [e.lat, e.lng] as [number, number]),
            ),
            { padding: [40, 40], maxZoom: 12 },
          );
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [items, retry]);
  return (
    <div className="map-wrapper">
      <div ref={ref} className="map-canvas" aria-label="我们的恋爱地图" />
      {failed && (
        <div className="map-fallback" role="status">
          <p>
            在线底图暂时无法加载，地点记录和照片仍保存在本机。你可以继续点击标记，或使用下方地点列表。
          </p>
          <div>
            <button
              className="button secondary"
              onClick={() => setRetry((n) => n + 1)}
            >
              重新加载底图
            </button>
            <button className="button secondary" onClick={onFallback}>
              切换地点列表
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
