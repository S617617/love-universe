const fs = require("node:fs"),
  path = require("node:path");
const out = path.resolve("out");
if (!fs.existsSync(path.join(out, "index.html")))
  throw Error("缺少 out/index.html，请先完成 Next.js 静态导出");
fs.writeFileSync(path.join(out, ".nojekyll"), "");
const prefix = "/love-universe";
const script = `(()=>{const prefix=${JSON.stringify(prefix)};const pathname=location.pathname;if(!pathname.startsWith(prefix+'/'))return;const relative=pathname.slice(prefix.length);const match=relative.match(/^\\/(memories|story|diary|letters|universe|growth|future-mailbox|map)\\/([^/]+)\\/?$/);if(!match||match[2]==='read')return;try{const id=decodeURIComponent(match[2]);location.replace(prefix+'/'+match[1]+'/read/?id='+encodeURIComponent(id));}catch{}})();`;
fs.writeFileSync(path.join(out, "legacy-redirect.js"), script);
const errorFile = path.join(out, "404.html");
if (fs.existsSync(errorFile)) {
  const html = fs
    .readFileSync(errorFile, "utf8")
    .replace(
      "</head>",
      `<script src="${prefix}/legacy-redirect.js"></script></head>`,
    );
  fs.writeFileSync(errorFile, html);
}
console.log(
  "静态导出已准备：/love-universe/、.nojekyll 和旧详情地址兼容跳转。",
);
