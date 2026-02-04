const { ethers } = require("ethers");
const xlsx = require("xlsx");
const fs = require("fs");

// ================= RPC =================
const provider = new ethers.providers.StaticJsonRpcProvider(
  "https://rpc.zerion.io/v1/ink"
);

// ============== NFT ====================
const NFT_CONTRACT = "0x92808d029fDEaAeb589305E280Dd0E6A10BfD016";
const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];
const nftContract = new ethers.Contract(
  NFT_CONTRACT,
  NFT_ABI,
  provider
);

// ============ CONFIG ===================
const CSV_FILE = "data_checked.csv";
const SAVE_EVERY = 100;     // checkpoint
const CONCURRENCY = 6;      // số ví check song song
const BASE_WEI = ethers.BigNumber.from("2000000000"); // 2 gwei
// ======================================

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = v.toString();
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function main() {
  // đọc excel
  const workbook = xlsx.readFile("data.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // tạo CSV + header nếu chưa tồn tại
  if (!fs.existsSync(CSV_FILE)) {
    const header = [
      rows[0][0] || "PrivateKey",
      rows[0][1] || "",
      "Native Balance",
      "NFT Balance"
    ];
    fs.writeFileSync(
      CSV_FILE,
      header.map(csvEscape).join(",") + "\n"
    );
  }

  let buffer = [];
  let processed = 0;

  async function processRow(i) {
    const privkey = rows[i][0];
    if (!privkey) return;

    try {
      const wallet = new ethers.Wallet(privkey, provider);
      const address = wallet.address;

      // 1️⃣ check native
      const nativeWei = await provider.getBalance(address);
      const nativeEth = ethers.utils.formatEther(nativeWei);

      let nftBal = "0";

      // 2️⃣ chỉ check NFT nếu native KHÔNG chia hết cho 2 gwei
      if (!nativeWei.mod(BASE_WEI).isZero()) {
        nftBal = (await nftContract.balanceOf(address)).toString();
      }

      buffer.push([
        privkey,
        rows[i][1] || "",
        nativeEth,
        nftBal
      ].map(csvEscape).join(","));

    } catch (err) {
      buffer.push([
        privkey,
        rows[i][1] || "",
        "Error",
        "Error"
      ].map(csvEscape).join(","));
    }
  }

  // ==== chạy theo pool ====
  for (let i = 1; i < rows.length; i += CONCURRENCY) {
    const tasks = [];
    for (let j = 0; j < CONCURRENCY && i + j < rows.length; j++) {
      tasks.push(processRow(i + j));
    }

    await Promise.all(tasks);
    processed += tasks.length;

    // checkpoint
    if (processed % SAVE_EVERY === 0) {
      fs.appendFileSync(CSV_FILE, buffer.join("\n") + "\n");
      buffer = [];
      console.log(`💾 Saved CSV checkpoint at ${processed} wallets`);
    }
  }

  // ghi nốt phần còn lại
  if (buffer.length > 0) {
    fs.appendFileSync(CSV_FILE, buffer.join("\n") + "\n");
  }

  console.log("✅ DONE – all wallets processed");
}

main();
