import React, { useState, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers'
import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address, refundCampaign } = useStateContext();
  const { isDarkMode } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [confirmCampaignName, setConfirmCampaignName] = useState('');
  const [isSuspended, setIsSuspended] = useState(state?.isSuspended || false);
  const [isRefunded, setIsRefunded] = useState(state?.isRefunded || false);

  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {
    const data = await getDonations(state.pId);
    setDonators(data);
  }

  useEffect(() => {
    if(contract) fetchDonators();
  }, [contract, address])

  const handleDonate = async () => {
    setIsLoading(true);
    try {
      await donate(state.pId, amount);
      navigate('/');
    } catch (error) {
      console.error("Error donating:", error);
      alert("Error donating to campaign. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSuspendCampaign = async () => {
    setIsLoading(true);
    try {
      setIsSuspended(!isSuspended);
      // Update the campaign state to reflect the new status
      const updatedState = {
        ...state,
        isSuspended: !isSuspended
      };
      navigate(`/campaign-details/${state.title}`, { state: updatedState });
    } catch (error) {
      console.error("Error suspending campaign:", error);
      alert("Error suspending campaign. Please try again.");
    }
    setIsLoading(false);
  };

  const handleRefundCampaign = async () => {
    if (confirmCampaignName !== state.title) {
      alert("Campaign name doesn't match. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      await refundCampaign(state.pId);
      setIsRefunded(true);
      setShowRefundModal(false);
      const updatedState = {
        ...state,
        isRefunded: true,
        isSuspended: false
      };
      navigate('/', { state: updatedState });
    } catch (error) {
      console.error("Error refunding campaign:", error);
      alert("Error refunding campaign. Please try again.");
    }
    setIsLoading(false);
  };

  const formatEth = (value) => {
    if (!value) return '0.00';
    try {
      // Convert from Wei to ETH
      const ethValue = ethers.utils.formatEther(value);
      return parseFloat(ethValue).toFixed(2);
    } catch (error) {
      console.error('Error formatting ETH value:', error);
      return '0.00';
    }
  };

  // Add null check before accessing campaign properties
  if (!state) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="font-epilogue font-bold text-[20px] text-white text-center">
          Loading campaign details...
        </p>
      </div>
    );
  }

  const isCampaignSuspended = state?.isSuspended || false;

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {isLoading && <Loader />}
      
      {/* Campaign Status Banner */}
      <div className={`w-full py-3 px-4 mb-6 rounded-lg flex items-center justify-between
        ${isSuspended ? 'bg-yellow-100 dark:bg-yellow-500/10' : 
          isRefunded ? 'bg-red-100 dark:bg-red-500/10' : 
          'bg-green-100 dark:bg-green-500/10'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {isSuspended ? '🟠' : isRefunded ? '🔴' : '🟢'}
          </span>
          <span className={`font-epilogue font-semibold ${
            isSuspended ? 'text-yellow-600 dark:text-yellow-400' : 
            isRefunded ? 'text-red-600 dark:text-red-400' : 
            'text-green-600 dark:text-green-400'
          }`}>
            Campaign Status: {isSuspended ? 'Suspended' : isRefunded ? 'Refunded' : 'Active'}
          </span>
        </div>
        {address === state.owner && !isRefunded && (
          <button
            className={`font-epilogue font-semibold px-4 py-2 rounded-lg
              ${isSuspended ? 
                'bg-green-500 hover:bg-green-600 text-white' : 
                'bg-yellow-500 hover:bg-yellow-600 text-white'
              } transition-colors`}
            onClick={handleSuspendCampaign}
          >
            {isSuspended ? 'Reactivate' : 'Suspend'}
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Campaign Image */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-[var(--background)]">
            <img 
              src={state.image} 
              alt="campaign" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Progress Section */}
          <div className="bg-[var(--card)] rounded-[15px] p-6 border border-[var(--border)]">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-epilogue font-semibold text-[var(--text)]">
                  {formatEth(state.amountCollected)} ETH
                  <span className="font-normal text-[var(--subtext)] ml-1">raised of {formatEth(state.target)} ETH</span>
                </p>
                <p className="font-epilogue font-semibold text-[var(--text)]">{calculateBarPercentage(state.target, state.amountCollected)}%</p>
              </div>
              <div className="relative w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                  style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%` }}
                />
              </div>
            </div>
            
            {/* Campaign Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--background)] rounded-lg">
              <div>
                <p className="font-epilogue text-[var(--subtext)] text-xs mb-1">Days Left</p>
                <p className={`font-epilogue font-semibold ${remainingDays <= 5 ? 'text-[var(--error)]' : 'text-[var(--text)]'}`}>
                  {remainingDays}
                </p>
              </div>
              <div>
                <p className="font-epilogue text-[var(--subtext)] text-xs mb-1">Total Backers</p>
                <p className="font-epilogue font-semibold text-[var(--text)]">{donators.length}</p>
              </div>
              <div>
                <p className="font-epilogue text-[var(--subtext)] text-xs mb-1">Average Donation</p>
                <p className="font-epilogue font-semibold text-[var(--text)]">
                  {donators.length > 0 ? formatEth(state.amountCollected / donators.length) : '0'} ETH
                </p>
              </div>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-[var(--card)] rounded-[15px] p-6 border border-[var(--border)]">
            <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] mb-4">Creator</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[var(--background)]">
                  <img src={thirdweb} alt="user" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-epilogue font-semibold text-[14px] text-[var(--text)] break-all">{state.owner}</h4>
                  <p className="font-epilogue text-[12px] text-[var(--subtext)]">{/* campaigns.filter((campaign) => campaign.owner === state.owner)?.length || 0 */} Campaigns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-[var(--card)] rounded-[15px] p-6 border border-[var(--border)]">
            <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] mb-4">Story</h4>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown 
                children={state.description}
                className="font-epilogue text-[var(--text)]"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fund Form */}
          <div className="flex-1">
            <div className="sticky top-[20px]">
              <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] uppercase">Fund</h4>   

              <div className="mt-[20px] flex flex-col p-4 bg-[var(--card)] rounded-[10px]">
                <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[var(--text)]">
                  Fund the campaign
                </p>
                <div className="mt-[30px]">
                  <input 
                    type="number"
                    placeholder="ETH 0.1"
                    step="0.01"
                    className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[var(--border)] bg-transparent font-epilogue text-[var(--text)] text-[18px] leading-[30px] placeholder:text-[var(--subtext)] rounded-[10px]"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <div className="my-[20px] p-4 bg-[var(--background)] rounded-[10px]">
                    <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-[var(--text)]">Back it because you believe in it.</h4>
                    <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[var(--subtext)]">Support the project for no reward, just because it speaks to you.</p>
                  </div>

                  {address ? (
                    <CustomButton 
                      btnType="button"
                      title="Fund Campaign"
                      styles="w-full bg-[var(--accent)]"
                      handleClick={handleDonate}
                    />
                  ) : (
                    <CustomButton 
                      btnType="button"
                      title="Connect Wallet"
                      styles="w-full bg-[var(--accent)]"
                      handleClick={() => navigate('/connect-wallet')}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Donators List */}
          <div className="sticky top-[20px]">
            <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] uppercase">Donators</h4>   

            <div className="mt-[20px] flex flex-col p-4 bg-[var(--card)] rounded-[10px]">
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                {donators.length > 0 ? donators.map((item, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-[var(--text)] leading-[26px] break-all">{item.donator}</p>
                    <p className="font-epilogue font-normal text-[16px] text-[var(--text)] leading-[26px] break-all">{formatEth(item.donation)} ETH</p>
                  </div>
                )) : (
                  <p className="font-epilogue font-normal text-[16px] text-[var(--subtext)] leading-[26px] text-justify">No donators yet. Be the first one!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {state.owner === address && (
        <div className='mt-8 mb-12 flex gap-4 justify-end'>
          <CustomButton 
            btnType="button"
            title="Refund Campaign"
            styles="bg-[var(--error)]"
            handleClick={() => setShowRefundModal(true)}
          />
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] p-6 rounded-lg w-full max-w-[500px]">
            <h3 className="font-epilogue font-semibold text-[20px] text-[var(--text)] mb-4">
              Confirm Campaign Refund
            </h3>
            <p className="text-[var(--subtext)] mb-4">
              This action cannot be undone. To confirm, please type the campaign name:
              <span className="block mt-2 font-semibold text-[var(--text)]">{state.title}</span>
            </p>
            <input
              type="text"
              value={confirmCampaignName}
              onChange={(e) => setConfirmCampaignName(e.target.value)}
              placeholder="Type campaign name here"
              className="w-full p-3 rounded-lg bg-[var(--background)] text-[var(--text)] border border-[var(--border)] mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 rounded-lg bg-[var(--background)] text-[var(--text)] hover:bg-[var(--background)]/80"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundCampaign}
                disabled={confirmCampaignName !== state.title}
                className={`px-4 py-2 rounded-lg bg-[var(--error)] text-white hover:bg-[var(--error)]/90 
                  ${confirmCampaignName !== state.title ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignDetails;