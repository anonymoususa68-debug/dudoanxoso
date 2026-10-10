import fs from "fs";
import path from "path";

const ketQua = JSON.parse(fs.readFileSync(path.join("data", "ketqua.json"), "utf-8"));
const template = fs.readFileSync(path.join("src", "template.html"), "utf-8");

const html = template.replace("__DATA__", JSON.stringify(ketQua));

fs.writeFileSync(path.join("gh-pages", "index.html"), html);
console.log("✅ Đã xuất index.html");