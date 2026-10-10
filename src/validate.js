import fs from "fs";
import path from "path";

function kiemTraDuLieu(raw) {
  const loi = [];
  
  if (!raw.data) {
    loi.push("Không có dữ liệu");
    return loi;
  }
  
  // Kiểm tra ngày
  if (!raw.ngay) {
    loi.push("Không có ngày dữ liệu");
  } else {
    const homQua = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (raw.ngay !== homQua) {
      loi.push(`Dữ liệu không phải hôm qua (${raw.ngay} vs ${homQua})`);
    }
  }
  
  // Kiểm tra dữ liệu JSON từ khiemdoan
  if (raw.nguon === "khiemdoan") {
    const arr = raw.data;
    if (!Array.isArray(arr) || arr.length === 0) {
      loi.push("Dữ liệu JSON rỗng hoặc sai định dạng");
    } else {
      const moiNhat = arr[arr.length - 1];
      const dacBiet = moiNhat.special || moiNhat.giai_dac_biet || moiNhat["Giải đặc biệt"];
      if (!dacBiet || !/^\d{5}$/.test(String(dacBiet))) {
        loi.push("Giải đặc biệt không đúng 5 chữ số");
      }
      
      // Kiểm tra trùng với hôm trước
      if (arr.length >= 2) {
        const truoc = arr[arr.length - 2];
        const dacBietTruoc = truoc.special || truoc.giai_dac_biet;
        if (dacBiet === dacBietTruoc) {
          loi.push("Giải đặc biệt trùng với hôm trước");
        }
      }
    }
  }
  
  return loi;
}

const raw = JSON.parse(fs.readFileSync(path.join("data", "raw.json"), "utf-8"));
const loi = kiemTraDuLieu(raw);

fs.writeFileSync(
  path.join("data", "validated.json"),
  JSON.stringify({ ...raw, loi, hopLe: loi.length === 0 }, null, 2)
);

if (loi.length > 0) {
  console.log("⚠️ Cảnh báo dữ liệu:");
  loi.forEach(l => console.log("  - " + l));
} else {
  console.log("✅ Dữ liệu hợp lệ");
}