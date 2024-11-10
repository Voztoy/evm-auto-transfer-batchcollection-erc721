const { ethers } = require('ethers');
const fs = require('fs');
const colors = require('colors');

// Đặt URL của RPC
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL'); // Thay bằng RPC URL của bạn

// Địa chỉ hợp đồng NFT ERC-721 và ABI
const nftContractAddress = 'NFT_Contract';
const nftAbi = [
  "function safeTransferFrom(address from, address to, uint256 tokenId) external"
];

// Địa chỉ ví nhận
const recipientAddress = 'YOUR_RECEIVE_ADDRESS';

// Đọc danh sách `privateKeys` và `tokenIds` từ file JSON
const walletsData = JSON.parse(fs.readFileSync('walletsData.json'));

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

// Hàm chính để chuyển tất cả NFT từ từng ví
async function main() {
  for (const { privateKey, tokenIds } of walletsData) {
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(colors.cyan(`💼 Processing wallet: ${wallet.address}`));

    for (const tokenId of tokenIds) {
      console.log(colors.yellow(`🔄 Transferring Token ID: ${tokenId} from wallet: ${wallet.address}`));
      await transferNFT(wallet, tokenId);
    }
  }

  console.log(colors.green('All NFT transfers completed.'));
}

main().catch((error) => {
  console.error(colors.red('🚨 An unexpected error occurred:'), error);
});
