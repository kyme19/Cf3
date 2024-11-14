# FundFair 💚 - Web3 Crowdfunding Platform

FundFair is a modern, decentralized crowdfunding platform built on Web3 technology. It enables users to create, manage, and contribute to crowdfunding campaigns using cryptocurrency (ETH), with features like AI-powered insights, real-time analytics, and an intuitive user interface.

## 🌟 Features

- **Web3 Integration**: Seamless connection with MetaMask and other Web3 wallets
- **Smart Contract Powered**: Secure and transparent campaign management
- **AI-Generated Insights**: Campaign analysis and recommendations using Google's Generative AI
- **Real-time Analytics**: Interactive charts and metrics for campaign performance
- **Responsive Design**: Modern UI that works across all devices
- **Dark/Light Mode**: Theme support for better user experience
- **Campaign Management**: Create, edit, and track crowdfunding campaigns
- **ETH Transactions**: Direct cryptocurrency contributions and withdrawals

## 🛠️ Technology Stack

### Frontend
- **React**: ^18.2.0
- **Vite**: ^4.3.2
- **Tailwind CSS**: ^3.3.2 (Styling)
- **Chart.js/React-Chartjs-2**: ^5.2.0 (Data visualization)
- **@thirdweb-dev/react**: ^3.14.40 (Web3 integration)
- **ethers**: ^5.7.2 (Ethereum interactions)

### AI Integration
- **@google/generative-ai**: Latest version (AI-powered insights)

### Smart Contracts
- **Solidity**: ^0.8.9
- **Hardhat**: Development environment
- **Sepolia**: Test network

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MetaMask wallet extension
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd fundfair
```

2. Install dependencies:
```bash
cd client
npm install
```

3. Create a .env file in the client directory:
```env
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

4. Start the development server:
```bash
npm run dev
```

### Smart Contract Setup

1. Navigate to the web3 directory:
```bash
cd ../web3
npm install
```

2. Create a .env file in the web3 directory:
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

3. Deploy the contract:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔧 Configuration

### Environment Variables

#### Client (.env)
- `VITE_GOOGLE_API_KEY`: Google AI API key for campaign insights
- `VITE_THIRDWEB_CLIENT_ID`: ThirdWeb client ID for Web3 integration

#### Smart Contract (.env)
- `PRIVATE_KEY`: Your wallet's private key
- `SEPOLIA_RPC_URL`: Sepolia network RPC URL

### Network Configuration

The platform is configured to work with the Sepolia test network by default. To change networks:

1. Update the network configuration in `client/src/context/index.jsx`
2. Deploy the contract to the new network
3. Update the contract address in the frontend

## 📝 Development Guidelines

### Code Structure

- `/client`: Frontend React application
  - `/src/components`: Reusable UI components
  - `/src/pages`: Main application pages
  - `/src/context`: Application state management
  - `/src/assets`: Static assets and images
  - `/src/utils`: Helper functions and utilities

- `/web3`: Smart contract development
  - `/contracts`: Solidity smart contracts
  - `/scripts`: Deployment and testing scripts
  - `/test`: Contract test files

### Best Practices

1. **Component Organization**
   - Use functional components with hooks
   - Implement proper prop-types
   - Keep components focused and reusable

2. **State Management**
   - Use Context API for global state
   - Implement proper loading states
   - Handle errors gracefully

3. **Web3 Integration**
   - Always check wallet connection
   - Implement proper error handling for transactions
   - Use proper ETH value formatting

4. **Styling**
   - Follow Tailwind CSS class ordering
   - Use theme variables for consistency
   - Maintain responsive design principles

## 🔒 Security Considerations

1. **Smart Contract**
   - Never expose private keys
   - Implement proper access controls
   - Follow withdrawal pattern

2. **Frontend**
   - Secure API key storage
   - Input validation
   - XSS prevention

3. **User Data**
   - No sensitive data storage
   - Proper transaction handling
   - Secure wallet connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ThirdWeb for Web3 development tools
- Google for AI capabilities
- OpenZeppelin for smart contract standards
- Community contributors and testers

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with 💚 by the FundFair Team
