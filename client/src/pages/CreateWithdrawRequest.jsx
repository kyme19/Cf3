import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton, FormField } from '../components';
import { useStateContext } from '../context';

const CreateWithdrawRequest = () => {
  const navigate = useNavigate();
  const { address, contract, getUserCampaigns, createWithdrawRequest } = useStateContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [form, setForm] = useState({
    campaignId: '',
    description: '',
    amount: '',
    recipient: ''
  });

  useEffect(() => {
    const fetchUserCampaigns = async () => {
      if (contract && address) {
        const campaigns = await getUserCampaigns();
        setUserCampaigns(campaigns);
      }
    };

    fetchUserCampaigns();
  }, [address, contract, getUserCampaigns]);

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.campaignId || !form.description || !form.amount || !form.recipient) {
        alert("Please fill all the fields");
        return;
    }
    
    try {
        setIsLoading(true);
        const result = await createWithdrawRequest(
            form.campaignId,
            form.description,
            form.amount,
            form.recipient
        );
        
        if (result.success) {
            navigate(`/campaign/${form.campaignId}/withdraw`);
        } else {
            throw new Error("Failed to create withdrawal request");
        }
    } catch (error) {
        console.error("Error creating withdrawal request:", error);
        alert("Failed to create withdrawal request. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4 transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:min-w-[380px] bg-[var(--secondary)] rounded-[10px] w-full">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-[var(--text)]">
          Create a Withdrawal Request
        </h1>
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[var(--background)] flex justify-center items-center">
          💰
        </div>
      </div>

      {/* Wallet Status */}
      <div className="w-full mt-[20px]">
        <div className={`p-4 ${address ? 'bg-[#1dc071]/10' : 'bg-[#feefde]'} rounded-[10px] flex items-center gap-2`}>
          <span className={address ? 'text-[#1dc071]' : 'text-[#ff8a00]'}>{address ? '🟢' : '⚠'}</span>
          <p className="font-epilogue font-normal text-[var(--subtext)]">
            {address 
              ? 'Wallet Connected: ' + address.slice(0, 6) + '...' + address.slice(-4)
              : 'Please Connect Your Wallet First to Create a Request'
            }
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="w-full flex justify-start items-center p-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[var(--accent)] hover:opacity-80 transition-opacity"
        >
          <span className="mr-2">←</span> Back to Requests
        </button>
      </div>

      {/* Form */}
      <form 
        onSubmit={handleSubmit}
        className="w-full mt-[20px] flex flex-col gap-[30px]"
      >
        <div className="flex flex-wrap gap-[40px]">
          {/* Campaign Selection */}
          <div className="flex-1">
            <h4 className="font-epilogue font-medium text-[14px] leading-[22px] text-[var(--text)] mb-[10px]">
              Select Campaign *
            </h4>
            <select
              value={form.campaignId}
              onChange={(e) => handleFormFieldChange('campaignId', e)}
              className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[var(--border)] 
                bg-[var(--background)] font-epilogue text-[var(--text)] text-[14px] 
                placeholder:text-[var(--subtext)] rounded-[10px] sm:min-w-[300px]
                focus:border-[var(--accent)] transition-colors duration-200"
            >
              <option value="" disabled className="bg-[var(--background)] text-[var(--text)]">
                Select a campaign
              </option>
              {userCampaigns.map((campaign) => (
                <option 
                  key={campaign.pId} 
                  value={campaign.pId}
                  className="bg-[var(--background)] text-[var(--text)]"
                >
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          <FormField 
            labelName="Request Description *"
            placeholder="Why do you need these funds?"
            inputType="text"
            value={form.description}
            handleChange={(e) => handleFormFieldChange('description', e)}
          />
          <FormField 
            labelName="Amount in Ether *"
            placeholder="0.50"
            inputType="number"
            value={form.amount}
            handleChange={(e) => handleFormFieldChange('amount', e)}
          />
          <FormField 
            labelName="Recipient Ethereum Wallet Address *"
            placeholder="0x..."
            inputType="text"
            value={form.recipient}
            handleChange={(e) => handleFormFieldChange('recipient', e)}
          />
        </div>

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton 
            btnType="submit"
            title={isLoading ? 'Creating...' : 'Create Request'}
            styles="bg-[var(--accent)]"
            disabled={!address || !form.campaignId}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateWithdrawRequest;