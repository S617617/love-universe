import type { Data, Entry } from "./store";
/** Entirely fictional, authored fixtures. Never constructed from browser/user data. */
export function createDemoData(
  base: Data,
  entry: (v: Partial<Entry>) => Entry,
): Data {
  const now = new Date();
  const day = (offset = 0) => {
    const d = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12),
    );
    return d.toISOString().slice(0, 10);
  };
  const sample = (id: string, v: Partial<Entry>) =>
    entry({ id: `demo-${id}`, source: "demo", ...v });
  return {
    ...base,
    settings: {
      ...base.settings,
      name1: "林间",
      name2: "星禾",
      avatar1: "/demo/avatar-lin.svg",
      avatar2: "/demo/avatar-xing.svg",
      met: "2025-03-14",
      start: "2025-05-20",
      message: "和你一起，把普通的日子过成值得回看的故事。",
      onboarded: true,
      demoProfile: true,
    },
    memories: [
      sample("first-meeting", {
        title: "那家书店，刚好遇见你",
        date: "2025-03-14",
        body: "我们同时伸手去拿那本旅行随笔。后来在窗边聊了很久，咖啡凉了，话题却一直没有结束。原来有些相遇，是从一句「你也喜欢这本书吗」开始的。",
        photo: "/demo/bookshop.svg",
      }),
      sample("seaside", {
        title: "把日落留给我们",
        date: day(-12),
        body: "没有赶行程，只是沿着海边慢慢走。你说今天的云像一封粉色的信，我们就坐下来，等它被夜色轻轻收好。",
        photo: "/demo/seaside.svg",
      }),
      sample("home-dinner", {
        title: "今天的小餐厅，只有两位客人",
        date: day(-2),
        body: "一起做的番茄意面有一点点咸。我们边笑边把它吃完，还给厨房起了一个名字：不着急餐厅。",
        photo: "/demo/picnic.svg",
      }),
    ],
    story: [
      sample("chapter-1", {
        title: "第一章 · 在书页之间遇见",
        date: "2025-03-14",
        order: 0,
        body: "最初只是两个喜欢同一本书的人。从交换书单，到分享一周里的小事，我们发现，原来有人愿意认真听你说话，是一件很温柔的事。",
        photo: "/demo/bookshop.svg",
      }),
      sample("chapter-2", {
        title: "第二章 · 把喜欢说给你听",
        date: "2025-05-20",
        order: 1,
        body: "那天没有精心安排的场景。散步回家的路上，我问你，下次、下下次，还能不能都和我一起走。你笑着说，好呀。",
      }),
      sample("chapter-3", {
        title: "第三章 · 未完待续的日常",
        date: day(-1),
        order: 2,
        hidden: true,
        body: "我们仍在学习怎样一起生活：认真听完一句话，留一盏晚归的灯，也给彼此留出独处的时间。故事不必每天精彩，但可以每天都多一点理解。",
      }),
    ],
    diary: [
      sample("diary-1", {
        title: "雨天也有小小的好心情",
        date: day(-4),
        mood: "平静",
        body: "出门时忘了带伞，回家时却有热茶等着。我们窝在沙发上看了一部老电影，窗外的雨声成了恰到好处的背景。",
      }),
      sample("diary-2", {
        title: "晚风把烦恼吹小了一点",
        date: day(-2),
        mood: "开心",
        body: "今天有些累。晚饭后一起绕着街区散步，没有急着给建议，只是认真听完彼此的一天。走回来时，心里轻了很多。",
        photo: "/demo/seaside.svg",
      }),
      sample("diary-3", {
        title: "是很普通，也很喜欢的一天",
        date: day(-1),
        mood: "心动",
        body: "一起买菜、整理房间，顺便给窗边的植物浇了水。没有特别的安排，但回头看到你在厨房忙碌，就觉得这样的日子很好。",
        photo: "/demo/picnic.svg",
      }),
    ],
    letters: [
      sample("letter", {
        title: "关于以后，我想慢慢和你说",
        date: day(-3),
        recipient: "星禾",
        background: "paper",
        body: "亲爱的星禾：\n\n我想记住的不只是那些盛大的日子，还有你在路边停下来拍一朵花的样子，以及我们在超市认真挑选晚餐的时刻。\n\n希望以后的我们，依然愿意分享新发现，也愿意在累的时候说一句「今天抱一抱我吧」。\n\n不必把每一天都过得完美。能一起慢慢来，就已经很好。\n\n林间",
        photo: "/demo/seaside.svg",
      }),
    ],
    universe: [
      sample("anniversary", {
        title: "第一次认真说喜欢",
        date: "2025-05-20",
        body: "那条走过很多次的小路，从这天起有了新的意义。",
      }),
      sample("birthday", {
        title: "星禾的生日",
        date: "2001-11-18",
        body: "今年想亲手做一张卡片，再留一整天给喜欢的事情。",
      }),
      sample("meeting", {
        title: "书店相遇纪念日",
        date: "2025-03-14",
        body: "带着新的书单，再去坐一坐那个窗边的位置。",
      }),
    ],
    growth: [
      sample("reading", {
        title: "一起读完两本书",
        date: day(-5),
        openDate: day(25),
        category: "阅读",
        target: 10,
        progress: 2,
        checkins: [day(-2), day(-1)],
        body: "每次读十页，分享一句喜欢的话。不赶进度，只享受一起阅读。",
      }),
      sample("walking", {
        title: "收集七次晚饭后的散步",
        date: day(-3),
        openDate: day(14),
        category: "运动",
        target: 7,
        progress: 1,
        checkins: [day(-1)],
        body: "不看步数，也不比速度。留二十分钟，认真聊聊这一天。",
      }),
    ],
    "future-mailbox": [
      sample("future-open", {
        title: "拆开一份来自昨天的祝福",
        date: day(-7),
        openDate: day(-1),
        recipient: "正在读信的你",
        body: "如果你打开了这封信，记得给自己倒一杯水，也给喜欢的人说一句谢谢。愿未来的日子，仍然有让你停下来微笑的小事。",
      }),
      sample("future-sealed", {
        title: "寄给两周后的我们",
        date: day(),
        openDate: day(14),
        recipient: "两周后的林间与星禾",
        body: "希望这两周里，我们都有好好休息，也给彼此留出一些不被打扰的时间。等读到这封信，一起去看一次日落吧。",
      }),
    ],
    map: [
      sample("place-bookshop", {
        title: "第一次相遇的书店",
        date: "2025-03-14",
        lat: 31.2304,
        lng: 121.4737,
        body: "上海市中心的示例坐标，承载一段虚构的书店故事，并非真实商家推荐。",
        photo: "/demo/bookshop.svg",
      }),
      sample("place-lake", {
        title: "想重游的湖边",
        date: day(-30),
        lat: 30.2489,
        lng: 120.1495,
        body: "杭州西湖附近的示例位置。慢慢走，看看水面和树影，把一天留给散步。",
        photo: "/demo/seaside.svg",
      }),
    ],
    garden: {
      points: 35,
      flowers: [
        {
          id: "demo-rose-bud",
          name: "初见的小心愿",
          xp: 20,
          wish: "愿每一次相见，都能多了解彼此一点。",
        },
        {
          id: "demo-rose-bloom",
          name: "日落留声",
          xp: 100,
          wish: "记得那个并肩看海的傍晚。",
        },
      ],
      tasks: [
        {
          id: "demo-task-listen",
          title: "今天认真听对方分享一件小事",
          done: false,
        },
        {
          id: "demo-task-walk",
          title: "一起散步，收集一个新发现",
          done: false,
        },
      ],
    },
    chat: [
      {
        id: "demo-chat-question",
        role: "user",
        content: "想要一个不用赶时间的周末约会点子。",
      },
      {
        id: "demo-chat-answer",
        role: "assistant",
        demo: true,
        content:
          "【预置演示对话，未调用 AI】\n可以把周末的一小段时间留给野餐：各准备一样喜欢的小食，带一本书或一份歌单。出门前确认天气和场地，给临时改变计划也留一点空间。",
      },
    ],
  };
}
