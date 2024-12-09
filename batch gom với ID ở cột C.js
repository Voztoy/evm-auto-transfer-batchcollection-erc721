const { ethers } = require('ethers');
const colors = require('colors');
const xlsx = require('xlsx');
const fs = require('fs');

// Đặt URL của RPC
const provider = new ethers.JsonRpcProvider('https://forno.celo.org');

// Địa chỉ hợp đồng NFT ERC-721 và ABI
const nftContractAddress = '0x41741305F8B70075aFADE9F2C059562D001423Ca';
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
    const tokenId = rows[i][2]; // Lấy Token ID từ cột C (index 2)

    if (privateKey && tokenId) {
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log(colors.cyan(`💼 Processing wallet: ${wallet.address}`));

      // Chuyển NFT
      console.log(colors.yellow(`🔄 Transferring Token ID: ${tokenId} from wallet: ${wallet.address}`));
      await transferNFT(wallet, tokenId);
    } else {
      console.log(colors.red(`❌ Missing data at row ${i + 1}: Private Key or Token ID is empty.`));
    }
  }

  console.log(colors.green('All NFT transfers completed.'));
}

main().catch((error) => {
  console.error(colors.red('🚨 An unexpected error occurred:'), error);
});
