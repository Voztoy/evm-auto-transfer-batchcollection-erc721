# EVM Auto Transfer

Welcome to the `evm-auto-transfer` repository! This script allows you to automate transactions across multiple EVM-compatible networks. Whether you're interacting with testnets or mainnets, this tool simplifies the process, especially for tasks requiring multiple transfers.

## Features

- 📡 Dynamic RPC URL, chain ID, and explorer integration from JSON files.
- 🔄 Automated transaction processing from multiple addresses.
- 🚀 Easily configurable for various networks (testnets and mainnets).
- 🔒 Secure handling of private keys.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Voztoy/evm-auto-transfer-batchcollection-erc721.git
   cd evm-auto-transfer-batchcollection-erc721
   ```

2. Install the necessary packages:

   ```bash
   npm install
   npm init -y
   npm install ethers colors
   ```

### Configuration

3. **Define the Chains**:

   - You'll need to specify the network details in JSON files located in the `/chains` directory. Create two JSON files: `testnet.json` and `mainnet.json`.
   - Each file should contain an array of objects with the following structure:

     ```json
     [
         {
             "name": "Network Name",
             "rpcUrl": "https://rpc-url",
             "chainId": "1234",
             "symbol": "TOKEN",
             "explorer": "https://explorer-url"
         }
     ]
     ```

   - Example for `testnet.json`:

     ```json
     [
         {
             "name": "Plume Testnet",
             "rpcUrl": "https://plume-testnet-rpc.example.com",
             "chainId": "8888",
             "symbol": "PLUME",
             "explorer": "https://plume-testnet-explorer.example.com"
         }
     ]
     ```

4. **Define Private Keys**:

   - Store your private keys securely inside a `privateKeys.json` file in the root directory. This file should contain an array of private keys as strings:

     ```json
     [
         "0xYOUR_PRIVATE_KEY_1",
         "0xYOUR_PRIVATE_KEY_2"
     ]
     ```

     **⚠️ Important**: Keep this file secure and avoid exposing your private keys!

5. **Find All ID of Collection**:

   - Trong file createIDFile.js

   // Địa chỉ hợp đồng ERC-721

   ```bash
   const CONTRACT_ADDRESS = "NFT_Contract"; Thay NFT_Contract bằng contract collection
   ```
   // Tạo provider cho mạng bạn muốn sử dụng
  
   ```bash
   const RPC_URL = "YOUR_RPC_URL"; // Thay đổi với URL RPC của bạn
   ```

   // Định nghĩa dãy ID mà bạn muốn lấy (lấy từ 1 đến hết hoặc khoảng ID tùy chỉnh)

   ```bash
   const startId = 17080; // ID bắt đầu
   const endId = 17105; // ID kết thúc
   ```
  
   - Run the following command to create a file ID.json containing the IDs within the specified range:
   
   ```bash
   node createIDFile.js
   ```

6. **Find ID of your wallet**:

   - Trong file checkWallets.js

    // Kết nối đến mạng
   
   ```bash
    const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL'); // Thay YOUR_RPC_URL bằng URL RPC của bạn.
   ```

   - Run the following command to create a file walletsData.json containing your wallet's IDs and private keys:
   
   ```bash
   node checkWallets.js
   ```

7. **Batch Collection all wallet**:

   - Trong file index.js

   // Đặt URL của RPC

   ```bash
   const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL'); // Thay bằng RPC URL của bạn
   ```

   // Địa chỉ hợp đồng NFT ERC-721 và ABI

   ```bash
   const nftContractAddress = 'NFT_Contract'; // Thay NFT_Contract bằng contract collection
   ```

   // Địa chỉ ví nhận

   ```bash
   const recipientAddress = 'YOUR_RECEIVE_ADDRESS'; // Thay YOUR_RECEIVE_ADDRESS bắng ví nhận của bạn
   ```

   - Run the following command to send all NFTs to a single wallet::
   
   ```bash
   npm start
   ```


### Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

## Donations

If you would like to support the development of this project, you can make a donation using the following addresses:

- **EVM**: `0x3e67E9c147Fa18dF710199D329F46bDaab128087`


### License

This project is licensed under the MIT License. See the `LICENSE` file for details.
"# evm-auto-transfer-batchcollection-erc721" 
