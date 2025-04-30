# 🚀 FundFair – Decentralized Crowdfunding Platform

**FundFair** is a Web3-powered crowdfunding platform that enables campaign creators to raise funds transparently while allowing contributors to participate in governance through smart contract-based voting. Built with **React**, **Solidity**, **Node.js**, and integrated with **MetaMask**, FundFair is modular, easy to use, and developer-friendly.

---

## 📦 Features

- ✅ Wallet-based authentication (MetaMask)
- ✅ Decentralized campaign creation and fund contribution
- ✅ Smart contract-based voting for withdrawal approvals
- ✅ Real-time transaction logging and analytics
- ✅ Modular frontend and backend architecture
- ✅ Etherscan and Thirdweb integration for contract tracking

---

## 🧰 System Requirements

Ensure your system has the following:

- **OS**: Windows 10/11, macOS, or modern Linux
- **Node.js**: Version 16 or higher
- **Git**: Version control
- **Browser**: Chrome, Firefox, or Edge
- **MetaMask**: Browser wallet extension
- **Code Editor**: Recommended: Visual Studio Code

> Optional:
> - MongoDB Atlas (for remote DB config)
> - Hardhat CLI (`npm install --save-dev hardhat`)

---

## 🔧 Installation and Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/kyme19/Cf3.git
cd Cf3
```

Or, if installed locally from a ZIP:

```bash
cd Cf3
```

---

### 2️⃣ Install Dependencies

In **two terminals**, install frontend and smart contract dependencies:

**Client:**

```bash
cd Cf3/client
npm install
# or
yarn install
```

**Blockchain Logic:**

```bash
cd Cf3/web3
npm install
# or
yarn install
```

---

### 3️⃣ Run the Application

Start the development server:

```bash
cd Cf3/client
npm start
# or
npm run dev
```

> Open [http://localhost:5173](http://localhost:5173)  
> Make sure MetaMask is connected and set to **Sepolia Testnet**

---

## 👥 Using FundFair

### 👤 Campaign Creators
- Log in with MetaMask
- Launch a new campaign with title, description, and funding goal
- Submit withdrawal requests for received funds
- Track campaign stats via dashboard

### 💸 Contributors
- Browse live campaigns
- Contribute ETH securely to a project
- Vote to approve or reject withdrawal requests
- View contribution history and transaction status

> Dashboards show **real-time statistics**, contribution trends, and campaign progress using dynamic charts.

---

## 🔑 Developer Notes

### Thirdweb & Etherscan API Setup

To deploy or test with your own keys:

#### ➤ Get Thirdweb API Key
- Go to: [thirdweb dashboard](https://thirdweb.com/dashboard)
- Create a project and generate a **Client ID** and **Secret Key**

#### ➤ Get Etherscan API Key
- Visit: [etherscan.io](https://etherscan.io)
- Register and create a new key from your dashboard

#### ➤ Add to `.env` File

```env
REACT_APP_THIRDWEB_API_KEY=your_key_here
REACT_APP_THIRDWEB_SECRET_KEY=your_secret_here
REACT_APP_ETHERSCAN_API_KEY=your_etherscan_key_here
```

---

## 🛠 Smart Contract Deployment (Optional)

To redeploy your contracts using Thirdweb:

```bash
npm install -g thirdweb
cd Cf3/web3
npx thirdweb deploy
```

Follow the prompts to deploy on your preferred network (e.g., Sepolia or Polygon Mumbai).

---

## 🧠 Contribution & Feedback

Want to improve FundFair?  
Feel free to fork the repo, open an issue, or submit a pull request. Contributions are welcome!

---

## 📜 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

## 👋 Acknowledgements

Built by [@kyme19](https://github.com/kyme19) as a final year project submission.  
Big shoutout to the Web3 and open-source community for inspiration!

---

**Live. Decentralized. Transparent. Welcome to FundFair. 💰**
```
