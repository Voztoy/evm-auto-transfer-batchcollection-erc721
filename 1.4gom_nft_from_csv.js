require("dotenv").config();
const fs = require("fs");
const readline = require("readline");
const { ethers } = require("ethers");

// ============ CONFIG ============
const RPC_URL = process.env.RPC_URL;
const NFT_CONTRACT = process.env.NFT_CONTRACT;
const TO_ADDRESS = process.env.TO_ADDRESS;

const INPUT = "wallet_tokenid_with_pk.csv";
const OUTPUT = "gom_result.csv";

const GAS_LIMIT = 80000;
// =================================

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const nftAbi = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external"
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(OUTPUT)) {
    fs.writeFileSync(OUTPUT, "wallet,tokenId,txHash\n");
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT),
    crlfDelay: Infinity,
  });

  let isHeader = true;
  let count = 0;

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const [privateKey, wallet, tokenId] = line.split(",");
    if (!privateKey || !wallet || !tokenId) continue;

    try {
      const signer = new ethers.Wallet(privateKey.trim(), provider);
      const contract = new ethers.Contract(NFT_CONTRACT, nftAbi, signer);

      console.log(`🚚 Gửi NFT ${tokenId} từ ${wallet}`);

      const tx = await contract.safeTransferFrom(
        wallet.trim(),
        TO_ADDRESS,
        tokenId.trim(),
        { gasLimit: GAS_LIMIT,
          gasPrice: ethers.utils.parseUnits("0.00000013", "gwei"),
        }
      );

      console.log(`✅ Tx sent: ${tx.hash}`);
      fs.appendFileSync(OUTPUT, `${wallet},${tokenId},${tx.hash}\n`);

      count++;
      await sleep(300); // nghỉ nhẹ tránh RPC choke

    } catch (err) {
      console.error(`❌ Lỗi với ${wallet} - token ${tokenId}:`, err.message);
    }
  }

  console.log(`\n🎉 DONE – Đã gom ${count} NFT`);
}

main();
