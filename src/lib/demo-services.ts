/** Safe static-only service: no API key, fetch, server dependency or model claim. */
export type DemoAction = "chat" | "润色" | "摘要" | "标题";
export async function requestDemoAI(input: {
  action: DemoAction;
  text?: string;
  messages?: { role: string; content: string }[];
}) {
  await new Promise<void>((resolve) => setTimeout(resolve, 180));
  const value = (input.text || "").trim();
  let text = "";
  if (input.action === "标题")
    text = value.split(/[。！!\n]/)[0].slice(0, 20) || "和你一起的平凡一天";
  else if (input.action === "摘要")
    text = `今天的片段：${value.slice(0, 160)}${value.length > 160 ? "…" : ""}`;
  else if (input.action === "润色")
    text = `${value}\n\n把这一刻记下来，留给以后一起回看。`;
  else {
    const last = input.messages?.at(-1)?.content || "";
    text = /零预算|免费/.test(last)
      ? "可以试试零预算的歌单约会：各选三首歌，轮流播放，讲讲为什么想把它分享给对方，再一起为歌单起个名字。"
      : /纪念日/.test(last)
        ? "各写三个最难忘的瞬间，晚餐时交换。把其中一个地点选作下一次重游的目的地，再写一封给明年彼此的信。"
        : "买两杯喜欢的饮料，去附近适合散步的地方。各自留意三个开心的小细节，回程时交换分享。出门前一起确认天气、路线与预算。";
    text +=
      "\n\n以上为浏览器本地规则演示，未调用 AI 模型，也没有分析个人记录。";
  }
  return { text, demo: true as const };
}
export async function unlockDemoChapter(password: string) {
  await new Promise<void>((resolve) => setTimeout(resolve, 120));
  if (password !== "love-demo")
    throw Error("密码不正确。静态演示密码为 love-demo。");
  return { unlocked: true, demo: true };
}
