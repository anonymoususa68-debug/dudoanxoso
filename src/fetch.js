import fs from "fs";
import path from "path";

const NGUON = [
  {
    ten: "khiemdoan",
    url: "https://raw.githubusercontent.com/khiemdoan/vietnam-lottery-xsmb-analysis/refs/heads/main/data/xsmb.json",
    loai: "json"
  },
  {
    ten: "minhngoc",
    url: (ngay) => `https://www.minhngoc.net/ket-qua-xo-so/mien-bac/${ngay}.html`,
    loai: "html"
  }
];

async function fetchTuNguon(nguon, ngay) {
  const url = typeof nguon.url === "function" ? nguon.url(ngay) : nguon.url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (nguon.loai === "json") {
    return await res.json();
  } else {
    return await res.text();
  }
}

async function layDuLieu() {
  const ngayHomQua = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  
  for (const nguon of NGUON) {
    try {
      console.log(`Đang thử nguồn: ${nguon.ten}...`);
      const data = await fetchTuNguon(nguon, ngayHomQua);
      console.log(`✅ Nguồn ${nguon.ten} thành công`);
      
      fs.writeFileSync(
        path.join("data", "raw.json"),
        JSON.stringify({ nguon: nguon.ten, data, ngay: ngayHomQua }, null, 2)
      );
      return;
    } catch (e) {
      console.log(`❌ Nguồn ${nguon.ten} thất bại: ${e.message}`);
    }
  }
  
  throw new Error("Tất cả nguồn đều thất bại");
}

layDuLieu().catch(e => {
  console.error("LỖI FETCH:", e.message);
  fs.writeFileSync(
    path.join("data", "raw.json"),
    JSON.stringify({ nguon: null, data: null, ngay: null, loi: e.message }, null, 2)
  );
});