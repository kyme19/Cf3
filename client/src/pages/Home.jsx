import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  
  const {address, contract, getCampagins} = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampagins();
    setCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  const HowItWorksCard = ({ emoji, title, description }) => (
    <div className="bg-[var(--card)] rounded-[15px] flex flex-col items-center text-center p-6 
      transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg border border-[var(--border)]">
      <span className="text-4xl mb-4">{emoji}</span>
      <h3 className="font-epilogue font-semibold text-[20px] text-[var(--text)] mb-3">{title}</h3>
      <p className="font-epilogue text-[var(--subtext)] text-[16px]">{description}</p>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="bg-[var(--card)] rounded-[15px] p-8 mb-[50px] border border-[var(--border)]">
        <h1 className="font-epilogue font-bold text-[32px] text-[var(--text)] text-center mb-4">
          Welcome to FundFair 🌟
        </h1>
        <p className="font-epilogue text-[var(--subtext)] text-[18px] text-center max-w-[800px] mx-auto">
          Join our community of changemakers and bring your ideas to life through decentralized crowdfunding.
        </p>
      </div>

      {/* Campaigns Section */}
      <div className="mb-[100px] ">
        <DisplayCampaigns 
          title="All Campaigns"
          isLoading={isLoading} 
          campaigns={campaigns}    
        />
      </div>

      {/* How FundFair Works Section */}
      <div className="py-[80px]">
        <h2 className="font-epilogue font-semibold text-[24px] text-[var(--text)] text-center mb-[60px]">
          How FundFair Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] max-w-6xl mx-auto px-4">
          <HowItWorksCard 
            emoji="🎯"
            title="Create Campaign"
            description="Start your fundraising journey by creating a detailed campaign with your goals and story"
          />
          <HowItWorksCard 
            emoji="🤝"
            title="Share & Connect"
            description="Share your campaign with the community and connect with supporters worldwide"
          />
          <HowItWorksCard 
            emoji="💫"
            title="Track Progress"
            description="Monitor your campaign's progress with real-time updates and transparent tracking"
          />
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-[var(--gradient-1)] rounded-[15px] p-8 text-center mb-[50px]">
        <h3 className="font-epilogue font-bold text-[24px] text-white mb-4">
          Ready to Start Your Campaign?
        </h3>
        <button 
          onClick={() => navigate('/create-campaign')}
          className="bg-white text-[var(--accent)] font-epilogue font-semibold px-6 py-3 rounded-[10px]
            hover:opacity-90 transition-opacity"
        >
          Start Fundraising
        </button>
      </div>
    </div>
  );
};

export default Home;