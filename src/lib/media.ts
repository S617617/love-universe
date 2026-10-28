// Photos live in IndexedDB; only small asset identifiers enter localStorage.
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("love-universe-media", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("photos");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(Error("照片存储不可用"));
  });
}
export async function storePhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("请选择 JPG、PNG 或 WebP 图片");
  if (file.size > 5 * 1024 * 1024) throw Error("单张照片不能超过 5MB");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((r, j) =>
    canvas.toBlob(
      (b) => (b ? r(b) : j(Error("图片处理失败"))),
      "image/webp",
      0.82,
    ),
  );
  const id = crypto.randomUUID();
  const database = await db();
  await new Promise<void>((r, j) => {
    const t = database.transaction("photos", "readwrite");
    t.objectStore("photos").put(blob, id);
    t.oncomplete = () => r();
    t.onerror = () => j(Error("照片保存失败"));
  });
  database.close();
  return "asset:" + id;
}
export async function loadPhoto(id: string): Promise<Blob | undefined> {
  const database = await db();
  return new Promise((r, j) => {
    const t = database.transaction("photos");
    const q = t.objectStore("photos").get(id.replace("asset:", ""));
    q.onsuccess = () => {
      r(q.result);
      database.close();
    };
    q.onerror = () => {
      j(Error("读取图片失败"));
      database.close();
    };
  });
}
export async function exportPhotos() {
  const database = await db();
  return new Promise<Record<string, string>>((resolve, reject) => {
    const t = database.transaction("photos");
    const store = t.objectStore("photos");
    const q = store.openCursor();
    const output: Record<string, string> = {};
    const reads: Promise<void>[] = [];
    q.onsuccess = () => {
      const c = q.result;
      if (c) {
        const key = String(c.key),
          blob = c.value as Blob;
        reads.push(
          new Promise((r, j) => {
            const reader = new FileReader();
            reader.onload = () => {
              output[key] = String(reader.result);
              r();
            };
            reader.onerror = () => j(Error("备份图片失败"));
            reader.readAsDataURL(blob);
          }),
        );
        c.continue();
      }
    };
    t.oncomplete = () => {
      database.close();
      Promise.all(reads)
        .then(() => resolve(output))
        .catch(reject);
    };
    t.onerror = reject;
  });
}
export async function importPhotos(photos: Record<string, string>) {
  const pairs = await Promise.all(
    Object.entries(photos).map(async ([id, data]) => {
      if (
        !/^[a-zA-Z0-9-]+$/.test(id) ||
        !/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data) ||
        data.length > 7_000_000
      )
        throw Error("备份图片无效");
      const blob = await (await fetch(data)).blob();
      return [id, blob] as const;
    }),
  );
  const database = await db();
  await new Promise<void>((r, j) => {
    const t = database.transaction("photos", "readwrite");
    for (const [id, blob] of pairs) t.objectStore("photos").put(blob, id);
    t.oncomplete = () => r();
    t.onerror = () => j(Error("导入图片失败"));
  });
  database.close();
}
export async function clearPhotos() {
  const database = await db();
  await new Promise<void>((r, j) => {
    const t = database.transaction("photos", "readwrite");
    t.objectStore("photos").clear();
    t.oncomplete = () => r();
    t.onerror = () => j(Error("清除图片失败"));
  });
  database.close();
}
