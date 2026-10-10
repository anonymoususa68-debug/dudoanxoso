import fs from "fs";
import path from "path";

const validated = JSON.parse(fs.readFileSync(path.join("data", "validated.json"), "utf-8"));

// Chuyển dữ liệu về mảng [ngày, đặc biệt, nhất]
function chuanHoaDuLieu(raw) {
  if (raw.nguon === "khiemdoan" && Array.isArray(raw.data)) {
    return raw.data.map(item => {
      const ngay = item.date || item.ngay || "";
      const dacBiet = item.special || item.giai_dac_biet || item["Giải đặc biệt"] || "";
      const giaiNhat = item.first || item.giai_nhat || item["Giải nhất"] || "";
      return [ngay, String(dacBiet), String(giaiNhat)];
    }).filter(d => d[0] && d[1]);
  }
  return [];
}

const duLieu = chuanHoaDuLieu(validated);

// ============ 30 BOT ============
function chay30Bot(duLieu, ngay) {
  const date = new Date(ngay);
  const thu = date.getDay();
  const truoc = duLieu.filter(d => d[0] < ngay).sort().pop();
  
  if (!truoc) {
    return { loi: "Không có dữ liệu ngày trước", ketQua: null };
  }
  
  const dacBiet = truoc[1];
  const giaiNhat = truoc[2];
  
  // ----- 10 BOT KẾ TOÁN -----
  const tatCaChuSo = (dacBiet + giaiNhat).split("").map(Number);
  const tongChuSo = tatCaChuSo.reduce((a, b) => a + b, 0);
  const trungBinh = (tongChuSo / tatCaChuSo.length).toFixed(2);
  const soChan = tatCaChuSo.filter(x => x % 2 === 0).length;
  const soLe = tatCaChuSo.length - soChan;
  const tongDe = (parseInt(dacBiet.slice(-2, -1)) + parseInt(dacBiet.slice(-1))) % 10;
  const hieuDe = Math.abs(parseInt(dacBiet.slice(-2, -1)) - parseInt(dacBiet.slice(-1)));
  const tongNhat = (parseInt(giaiNhat.slice(-2, -1)) + parseInt(giaiNhat.slice(-1))) % 10;
  const dauDe = dacBiet.slice(-2, -1);
  const duoiDe = dacBiet.slice(-1);
  
  const ketQuaKeToan = {
    kt01: "Đề + Nhất = 10 chữ số",
    kt02: "Tổng = " + tongChuSo,
    kt03: "TB = " + trungBinh,
    kt04: "Chẵn " + soChan + " / Lẻ " + soLe,
    kt05: "Tổng đề = " + tongDe,
    kt06: "Hiệu đề = " + hieuDe,
    kt07: "Tổng nhất = " + tongNhat,
    kt08: "Đầu " + dauDe + " / Đuôi " + duoiDe,
    kt09: duLieu.length + " ngày",
    kt10: "Tần suất: " + Object.entries(
      duLieu.reduce((acc, d) => {
        const s = d[1].slice(-2);
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {})
    ).map(([k, v]) => k + ":" + v).join(" ").slice(0, 40)
  };
  
  // ----- 10 BOT TỔNG HỢP -----
  const dauCount = {}, duoiCount = {};
  duLieu.forEach(d => {
    const s = d[1].slice(-2);
    dauCount[s[0]] = (dauCount[s[0]] || 0) + 1;
    duoiCount[s[1]] = (duoiCount[s[1]] || 0) + 1;
  });
  const topDau = Object.entries(dauCount).sort((a, b) => b[1] - a[1])[0];
  const topDuoi = Object.entries(duoiCount).sort((a, b) => b[1] - a[1])[0];
  
  const allLast2 = duLieu.map(d => d[1].slice(-2));
  const lastSeen = {};
  allLast2.forEach((s, i) => { lastSeen[s] = i; });
  const chuaRa = [];
  for (let i = 0; i < 100; i++) {
    const s = String(i).padStart(2, "0");
    if (!(s in lastSeen)) chuaRa.push(s);
  }
  const ganNhat = Object.entries(lastSeen).sort((a, b) => a[1] - b[1]).slice(0, 5);
  
  const capDoi = [];
  const setLast2 = new Set(allLast2);
  setLast2.forEach(s => {
    const rev = s.split("").reverse().join("");
    if (s !== rev && setLast2.has(rev)) capDoi.push(s + "-" + rev);
  });
  
  const ngayChan = [], ngayLe = [];
  duLieu.forEach(d => {
    const t = (parseInt(d[1].slice(-2, -1)) + parseInt(d[1].slice(-1))) % 10;
    if (t % 2 === 0) ngayChan.push(d[0]); else ngayLe.push(d[0]);
  });
  
  let chuoiLap = "Không phát hiện";
  for (let i = 1; i < duLieu.length; i++) {
    if (duLieu[i][1].slice(-2, -1) === duLieu[i - 1][1].slice(-2, -1)) {
      chuoiLap = "Đầu " + duLieu[i][1].slice(-2, -1) + " lặp " + duLieu[i - 1][0] + " → " + duLieu[i][0];
      break;
    }
  }
  
  const soSanh = duLieu.map(d => {
    const de = d[1].slice(-2), nhat = d[2].slice(-2);
    return de === nhat ? d[0] + ": TRÙNG" : null;
  }).filter(Boolean);
  
  const baNgay = duLieu.slice(-3).map(d => d[1].slice(-2));
  
  const ketQuaTongHop = {
    th01: "Đầu " + topDau[0] + " (" + topDau[1] + " lần)",
    th02: "Đuôi " + topDuoi[0] + " (" + topDuoi[1] + " lần)",
    th03: chuaRa.length ? chuaRa.slice(0, 5).join(", ") : "Không có",
    th04: ganNhat.map(x => x[0]).join(", "),
    th05: capDoi.length ? capDoi.slice(0, 5).join(" ") : "Không có",
    th06: ngayChan.length + " ngày: " + ngayChan.slice(-3).join(", "),
    th07: ngayLe.length + " ngày: " + ngayLe.slice(-3).join(", "),
    th08: chuoiLap,
    th09: soSanh.length ? soSanh.join("; ") : "Không có ngày trùng",
    th10: baNgay.join(" → ")
  };
  
  // ----- 10 BOT XỔ SỐ -----
  function pascal(s1, s2) {
    let arr = (s1 + s2).split("").map(Number);
    while (arr.length > 2) {
      const next = [];
      for (let i = 0; i < arr.length - 1; i++) next.push((arr[i] + arr[i + 1]) % 10);
      arr = next;
    }
    return arr.join("");
  }
  
  const p = pascal(dacBiet, giaiNhat);
  const pDao = p.split("").reverse().join("");
  
  const bacNhoThu = {
    0: ["89", "98"], 1: ["33", "14"], 2: ["35", "39"],
    3: ["41", "59"], 4: ["20", "74"], 5: ["63", "48"], 6: ["20", "02"]
  };
  const bnThu = bacNhoThu[thu];
  
  const bacNhoCap = {
    "68": ["39", "93"], "86": ["39", "93"],
    "25": ["03", "30"], "52": ["03", "30"],
    "49": ["20", "02"], "94": ["20", "02"],
    "78": ["23", "32"], "87": ["23", "32"]
  };
  const de2 = dacBiet.slice(-2);
  const bnCap = bacNhoCap[de2] || ["??", "??"];
  
  const de1 = parseInt(dacBiet.slice(-2, -1));
  const de2n = parseInt(dacBiet.slice(-1));
  const tongDe2 = (de1 + de2n) % 10;
  const hieuDe2 = Math.abs(de1 - de2n);
  const ghepDauDuoi = dauDe + duoiDe;
  
  const ganArr = chuaRa.length >= 2 ? [chuaRa[0], chuaRa[1]] : ["??", "??"];
  const nongArr = ganNhat.length >= 2 ? [ganNhat[0][0], ganNhat[1][0]] : ["??", "??"];
  
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  const seedNum = ngay.split("-").join("");
  const r1 = String(Math.floor(seededRandom(parseInt(seedNum)) * 100)).padStart(2, "0");
  const r2 = String(Math.floor(seededRandom(parseInt(seedNum) + 1) * 100)).padStart(2, "0");
  
  const ketQuaXoSo = {
    xs01: p + " " + (p.length === 2 ? p.split("").reverse().join("") : "??"),
    xs02: p + " " + pDao,
    xs03: bnThu[0] + " " + bnThu[1],
    xs04: bnCap[0] + " " + bnCap[1],
    xs05: tongDe2 + " " + ((tongDe2 + 5) % 10),
    xs06: hieuDe2 + " " + ((hieuDe2 + 5) % 10),
    xs07: ghepDauDuoi + " " + ghepDauDuoi.split("").reverse().join(""),
    xs08: ganArr[0] + " " + ganArr[1],
    xs09: nongArr[0] + " " + nongArr[1],
    xs10: r1 + " " + r2
  };
  
  // ----- BÌNH CHỌN -----
  const dem = {};
  Object.values(ketQuaXoSo).forEach(val => {
    val.split(" ").forEach(s => {
      if (/^\d{2}$/.test(s)) dem[s] = (dem[s] || 0) + 1;
    });
  });
  const xepHang = Object.entries(dem).sort((a, b) => b[1] - a[1]);
  let final1 = "??", final2 = "??";
  if (xepHang.length >= 2) {
    final1 = xepHang[0][0];
    final2 = xepHang[1][0];
  } else if (xepHang.length === 1) {
    final1 = xepHang[0][0];
    final2 = xepHang[0][0].split("").reverse().join("");
  }
  
  return {
    loi: validated.loi,
    ngayDuLieu: truoc[0],
    ngayChoi: ngay,
    dacBiet,
    giaiNhat,
    ketQuaKeToan,
    ketQuaTongHop,
    ketQuaXoSo,
    final: [final1, final2]
  };
}

// Chạy
const ngayHomNay = new Date().toISOString().slice(0, 10);
const ketQua = chay30Bot(duLieu, ngayHomNay);

fs.writeFileSync(
  path.join("data", "ketqua.json"),
  JSON.stringify(ketQua, null, 2)
);

console.log("✅ Đã chạy 30 bot. Kết quả cuối:", ketQua.final);