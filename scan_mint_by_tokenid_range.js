const { ethers } = require("ethers");
const fs = require("fs");

// ================= CONFIG =================
const RPC_URL = "https://rpc.zerion.io/v1/ink";
const NFT_CONTRACT = "0x92808d029fDEaAeb589305E280Dd0E6A10BfD016";

// 👉 CHỈ CẦN ĐỔI FROM_BLOCK NẾU MUỐN RESUME
const FROM_BLOCK = 36300000;
const TO_BLOCK   = 36450000;

const BLOCK_STEP = 100;
const OUTPUT = "mint_owner_tokenid.csv";
// =========================================

const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC = ethers.utils.id(
  "Transfer(address,address,uint256)"
);

// topic for from = 0x000...
const ZERO_TOPIC = ethers.utils.hexZeroPad(
  ethers.constants.AddressZero,
  32
);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // tạo file nếu chưa tồn tại
  if (!fs.existsSync(OUTPUT)) {
    fs.writeFileSync(OUTPUT, "owner,tokenId,blockNumber\n");
  }

  console.log("🚀 START SCAN MINT EVENTS");
  console.log(`⛓️ Blocks: ${FROM_BLOCK} → ${TO_BLOCK}`);
  console.log(`📄 Output: ${OUTPUT}\n`);

  for (let from = FROM_BLOCK; from <= TO_BLOCK; from += BLOCK_STEP) {
    const to = Math.min(from + BLOCK_STEP - 1, TO_BLOCK);

    try {
      const logs = await provider.getLogs({
        address: NFT_CONTRACT,
        fromBlock: from,
        toBlock: to,
        topics: [
          TRANSFER_TOPIC,
          ZERO_TOPIC // mint only
        ]
      });

      if (logs.length === 0) {
        console.log(`⏩ Blocks ${from}-${to}: 0 mint`);
        continue;
      }

      let buffer = "";

      for (const log of logs) {
        const owner = "0x" + log.topics[2].slice(26);
        const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
        buffer += `${owner},${tokenId},${log.blockNumber}\n`;
      }

      // 🔥 GHI NGAY SAU MỖI RANGE
      fs.appendFileSync(OUTPUT, buffer);

      console.log(
        `✅ Blocks ${from}-${to}: +${logs.length} NFT`
      );

    } catch (err) {
      console.error(
        `⚠️ RPC error at blocks ${from}-${to}: ${err.message}`
      );
      console.log("⏸️ Sleep 1s then continue...\n");
      await sleep(1000);
    }
  }

  console.log("\n🎉 DONE – SCAN COMPLETED");
}

main();
