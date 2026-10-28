import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";
export const runtime = "nodejs";
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  const passwordToCheck = process.env.STORY_PASSWORD || "love-demo";
  try {
    const raw = await request.text();
    if (raw.length > 2048)
      return NextResponse.json({ error: "请求过长" }, { status: 413 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    const state = attempts.get(ip);
    if (state && state.until > Date.now() && state.count >= 5)
      return NextResponse.json(
        { error: "尝试次数过多，请 5 分钟后重试。" },
        { status: 429 },
      );
    const { password } = JSON.parse(raw);
    if (typeof password !== "string")
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    const hash = (s: string) => createHash("sha256").update(s).digest();
    if (!timingSafeEqual(hash(password), hash(passwordToCheck))) {
      if (attempts.size > 1000) attempts.clear();
      attempts.set(ip, {
        count: state && state.until > Date.now() ? state.count + 1 : 1,
        until: Date.now() + 300000,
      });
      return NextResponse.json(
        { error: "密码不正确，再想一想。" },
        { status: 403 },
      );
    }
    attempts.delete(ip);
    return NextResponse.json({
      unlocked: true,
      demo: !process.env.STORY_PASSWORD,
    });
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }
}
