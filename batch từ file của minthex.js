const { ethers } = require('ethers');
const colors = require('colors');
const xlsx = require('xlsx');
const fs = require('fs');

// Đặt URL của RPC
const provider = new ethers.JsonRpcProvider('https://developer-access-mainnet.base.org');

// Địa chỉ hợp đồng NFT ERC-721 và ABI
const nftContractAddress = '0x802187c392b15CDC8df8Aa05bFeF314Df1f65C62';
const nftAbi = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external"
];

// Địa chỉ ví nhận
const recipientAddress = '0x3e67E9c147Fa18dF710199D329F46bDaab128087';

// Đọc dữ liệu từ file Excel
const excelFilePath = 'transaction_results.xlsx'; 
const workbook = xlsx.readFile(excelFilePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Hàm lắng nghe sự kiện Transfer để lấy tokenId từ giao dịch
const listenForTransferEvent = async (provider, contractAddress, txHash) => {
  const contractABI = [
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  let txReceipt;
  try {
    txReceipt = await provider.getTransactionReceipt(txHash);
  } catch (error) {
    console.log(colors.red(`❌ Lỗi khi lấy receipt: ${error.message}`));
    return;
  }

  if (!txReceipt) {
    console.log(colors.yellow('⏳ Transaction is still pending or not found.'));
    return;
  }

  for (let log of txReceipt.logs) {
    if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
      try {
        const transferEvent = contract.interface.decodeEventLog("Transfer", log.data, log.topics);
        const tokenId = transferEvent.tokenId.toString();
        console.log(colors.green(`Token ID của NFT bạn vừa mint là: ${tokenId}`));
        return tokenId;
      } catch (error) {
        console.log(colors.red('Không thể giải mã sự kiện Transfer.'));
      }
    }
  }

  console.log(colors.yellow('Không tìm thấy sự kiện Transfer trong giao dịch.'));
};

// Hàm để chuyển NFT
async function transferNFT(wallet, tokenId) {
  try {
    const nftContract = new ethers.Contract(nftContractAddress, nftAbi, wallet);
    const tx = await nftContract.safeTransferFrom(wallet.address, recipientAddress, tokenId);
    console.log(colors.green(`🔗 Transaction sent! Token ID: ${tokenId}, Tx Hash: ${tx.hash}`));

    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(colors.green(`✅ Transfer successful! Token ID: ${tokenId}, Block Number: ${receipt.blockNumber}`));
    } else {
      console.log(colors.red(`❌ Transfer failed for Token ID: ${tokenId}`));
    }
  } catch (error) {
    console.log(colors.red(`❌ Failed to transfer Token ID ${tokenId} from wallet ${wallet.address}: ${error.message}`));
  }
}

// Hàm chính để kiểm tra và chuyển NFT
async function main() {
  for (let i = 1; i < rows.length; i++) { // Bắt đầu từ i = 1 vì dòng đầu là tiêu đề
    const privateKey = rows[i][0];
    const txHash = rows[i][2];

    if (txHash) {
      console.log(`Đang kiểm tra giao dịch: ${txHash}`);

      // Lấy Token ID từ hash giao dịch
      const tokenId = await listenForTransferEvent(provider, nftContractAddress, txHash);

      if (tokenId) {
        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(colors.cyan(`💼 Processing wallet: ${wallet.address}`));

        // Chuyển NFT
        console.log(colors.yellow(`🔄 Transferring Token ID: ${tokenId} from wallet: ${wallet.address}`));
        await transferNFT(wallet, tokenId);
      }
    }
  }

  console.log(colors.green('All NFT transfers completed.'));
}

main().catch((error) => {
  console.error(colors.red('🚨 An unexpected error occurred:'), error);
});
