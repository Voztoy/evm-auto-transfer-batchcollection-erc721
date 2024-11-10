const { ethers } = require('ethers');
const fs = require('fs');
const colors = require('colors');

// Địa chỉ hợp đồng ERC-721
const CONTRACT_ADDRESS = "NFT_Contract";
const ERC721_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
];

// Hàm tạo file ID.json chỉ với dãy ID cụ thể
const createIDFile = async (provider, startId, endId) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_ABI, provider);
  
  try {
    const totalSupply = await contract.totalSupply();
    console.log(colors.cyan(`Tổng số token trong hợp đồng: ${totalSupply.toString()}`));

    const tokenOwners = {};

    for (let tokenId = startId; tokenId <= endId; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        tokenOwners[tokenId] = owner;
        console.log(colors.green(`🏷️ Token ID ${tokenId} thuộc về ví: ${owner}`));
      } catch (error) {
        // Bỏ qua các token ID không hợp lệ
        if (error.message.includes('revert')) {
          continue;
        }
        console.log(colors.red(`❌ Lỗi khi gọi ownerOf cho token ID ${tokenId}: ${error.message}`));
      }
    }

    // Lưu dữ liệu vào file ID.json
    fs.writeFileSync('ID.json', JSON.stringify(tokenOwners, null, 2));
    console.log(colors.green(`✅ Đã lưu thông tin token vào file ID.json`));
  } catch (error) {
    console.log(colors.red(`❌ Lỗi khi tạo file ID.json: ${error.message}`));
  }
};

const main = async () => {
  // Tạo provider cho mạng bạn muốn sử dụng
  const RPC_URL = "YOUR_RPC_URL"; // Thay đổi với URL RPC của bạn
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Định nghĩa dãy ID mà bạn muốn lấy
  const startId = 17035; // ID bắt đầu
  const endId = 17105; // ID kết thúc

  // Tạo file ID.json với dãy ID cụ thể
  await createIDFile(provider, startId, endId);
};

main().catch((error) => {
  console.error(colors.red('🚨 An unexpected error occurred:'), error);
});
