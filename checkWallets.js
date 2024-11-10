const fs = require('fs');
const { ethers } = require('ethers');
const colors = require('colors');

// Hàm để lấy danh sách token IDs từ ID.json
const loadTokenIDs = () => {
    const data = fs.readFileSync('ID.json');
    return JSON.parse(data);
};

// Hàm để đối chiếu ví với ID.json
const checkWalletsAgainstID = async (provider, privateKeys) => {
    const tokenIDs = loadTokenIDs();
    const walletsData = [];

    for (const privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey, provider);
        const tokenIdsOwned = [];

        for (const [tokenId, owner] of Object.entries(tokenIDs)) {
            if (owner.toLowerCase() === wallet.address.toLowerCase()) {
                tokenIdsOwned.push(tokenId);
            }
        }

        if (tokenIdsOwned.length > 0) {
            walletsData.push({
                privateKey: wallet.privateKey,
                tokenIds: tokenIdsOwned
            });
        }
    }

    return walletsData;
};

const saveWalletsDataToFile = (walletsData) => {
    fs.writeFileSync('walletsData.json', JSON.stringify(walletsData, null, 2));
};

const main = async () => {
    const privateKeys = JSON.parse(fs.readFileSync('privateKeys.json'));
    
    // Kết nối đến mạng
    const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL'); // Thay YOUR_RPC_URL bằng URL RPC của bạn.

    const walletsData = await checkWalletsAgainstID(provider, privateKeys);
    saveWalletsDataToFile(walletsData);

    console.log(colors.green('Đã lưu thông tin ví vào walletsData.json'));
};

main().catch((error) => {
    console.error(colors.red('🚨 Đã xảy ra lỗi:'), error);
});
