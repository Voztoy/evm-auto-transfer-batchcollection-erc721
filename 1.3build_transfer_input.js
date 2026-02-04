const fs = require("fs");
const readline = require("readline");

// ===== FILE PATH =====
const DATA_CHECKED = "data_checked.csv";
const MINT_FILE = "mint_owner_tokenid.csv";
const OUTPUT = "wallet_tokenid_with_pk.csv";
// =====================

function norm(addr) {
  return addr.trim().toLowerCase();
}

async function loadWalletMap() {
  const walletMap = new Map();

  const rl = readline.createInterface({
    input: fs.createReadStream(DATA_CHECKED),
    crlfDelay: Infinity,
  });

  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const cols = line.split(",");
    const privateKey = cols[0];
    const wallet = cols[1];
    const nftBalance = Number(cols[3]);

    if (privateKey && wallet && nftBalance > 0) {
      walletMap.set(norm(wallet), privateKey.trim());
    }
  }

  console.log(`✅ Loaded ${walletMap.size} wallets with private key`);
  return walletMap;
}

async function joinTokenId(walletMap) {
  const rl = readline.createInterface({
    input: fs.createReadStream(MINT_FILE),
    crlfDelay: Infinity,
  });

  const out = fs.createWriteStream(OUTPUT);
  out.write("privateKey,wallet,tokenId\n");

  let isHeader = true;
  let count = 0;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const [owner, tokenId] = line.split(",");

    const key = walletMap.get(norm(owner));
    if (key) {
      out.write(`${key},${owner},${tokenId}\n`);
      count++;
    }
  }

  out.end();
  console.log(`🎉 Done! Prepared ${count} NFT transfer records`);
}

async function main() {
  const walletMap = await loadWalletMap();
  await joinTokenId(walletMap);
}

main();
