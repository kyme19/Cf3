import React, {useState, useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const location = useLocation();
  
  const {address, contract, getCampaigns} = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setFilteredCampaigns(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  // Handle search parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');
    
    if (searchTerm) {
      const filtered = campaigns.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCampaigns(filtered);
    } else {
      setFilteredCampaigns(campaigns);
    }
  }, [location.search, campaigns]);

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
      <div className="bg-[var(--card)] rounded-[20px] p-12 mb-[60px] border border-[var(--border)] text-center">
        <div className="max-w-[900px] mx-auto">
          <h1 className="font-epilogue font-bold text-[40px] sm:text-[48px] text-[var(--text)] mb-6 leading-tight">
            FundFair - Where Ideas Meet Support 🌟
          </h1>
          <p className="font-epilogue text-[var(--subtext)] text-[18px] sm:text-[20px] mb-8 leading-relaxed">
            Join our thriving community of innovators and supporters. Together, we make great ideas happen through transparent, decentralized crowdfunding.
          </p>
          <Link 
            to="/create-campaign"
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-epilogue font-semibold px-8 py-4 rounded-[12px] hover:opacity-90 transition-all transform hover:scale-105"
          >
            Start Your Journey 
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-[60px]">
        <div className="bg-[var(--card)] rounded-[15px] p-6 text-center border border-[var(--border)]">
          <div className="font-epilogue font-bold text-[28px] text-[var(--text)] mb-2">{campaigns.length}</div>
          <div className="font-epilogue text-[var(--subtext)]">Active Campaigns</div>
        </div>
        <div className="bg-[var(--card)] rounded-[15px] p-6 text-center border border-[var(--border)]">
          <div className="font-epilogue font-bold text-[28px] text-[var(--text)] mb-2">100%</div>
          <div className="font-epilogue text-[var(--subtext)]">Funds to Creator</div>
        </div>
        <div className="bg-[var(--card)] rounded-[15px] p-6 text-center border border-[var(--border)]">
          <div className="font-epilogue font-bold text-[28px] text-[var(--text)] mb-2">0%</div>
          <div className="font-epilogue text-[var(--subtext)]">Platform Fees</div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="mb-[80px]">
        <DisplayCampaigns 
          title={location.search ? "Search Results" : "All Campaigns"}
          isLoading={isLoading} 
          campaigns={filteredCampaigns}    
        />
      </div>

      {/* How FundFair Works Section */}
      <div className="py-[60px] bg-[var(--background)] rounded-[20px]">
        <h2 className="font-epilogue font-semibold text-[28px] text-[var(--text)] text-center mb-[50px]">
          How FundFair Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] max-w-6xl mx-auto px-4">
          <HowItWorksCard 
            emoji="🎯"
            title="Create Campaign"
            description="Launch your campaign with a compelling story, clear goals, and engaging visuals"
          />
          <HowItWorksCard 
            emoji="🤝"
            title="Share & Connect"
            description="Reach supporters globally through our decentralized platform"
          />
          <HowItWorksCard 
            emoji="💫"
            title="Track Progress"
            description="Watch your campaign grow with real-time updates and transparent tracking"
          />
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-[var(--card)] rounded-[20px] p-12 text-center mt-[60px] mb-[50px] border border-[var(--border)]">
        <h3 className="font-epilogue font-bold text-[28px] text-[var(--text)] mb-6">
          Ready to Start Your Campaign?
        </h3>
        <p className="font-epilogue text-[var(--subtext)] text-[18px] mb-8 max-w-[600px] mx-auto">
          Join thousands of creators who have successfully funded their projects through FundFair.
        </p>
        <Link 
          to="/create-campaign"
          className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-epilogue font-semibold px-8 py-4 rounded-[12px] hover:opacity-90 transition-all transform hover:scale-105"
        >
          Start Fundraising 
          <span className="text-xl">→</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;