import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { CustomButton, FormField, Loader } from '../components';
import { useStateContext } from '../context';

const CreateWithdrawRequest = () => {
    const navigate = useNavigate();
    const { address, contract, getUserCampaigns, createWithdrawRequest } = useStateContext();
    
    const [isLoading, setIsLoading] = useState(false);
    const [userCampaigns, setUserCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        campaignId: '',
        description: '',
        amount: '',
        recipient: address || ''
    });

    useEffect(() => {
        const fetchUserCampaigns = async () => {
            try {
                if (!address) return;
                
                const campaigns = await getUserCampaigns();
                const ownedCampaigns = campaigns.filter(c => 
                    c.owner.toLowerCase() === address.toLowerCase() && !c.isRefunded
                );
                setUserCampaigns(ownedCampaigns);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
                setError("Failed to load your campaigns");
            }
        };

        fetchUserCampaigns();
    }, [address, getUserCampaigns]);

    const handleCampaignSelect = (campaignId) => {
        const campaign = userCampaigns.find(c => c.pId.toString() === campaignId);
        if (campaign) {
            // Convert numeric values to BigNumber
            campaign.amountCollected = ethers.BigNumber.from(campaign.amountCollected);
            campaign.deadline = ethers.BigNumber.from(campaign.deadline);
        }
        setSelectedCampaign(campaign);
        setForm(prev => ({ ...prev, campaignId }));
        setError('');
    };

    const handleFormFieldChange = (fieldName, e) => {
        let value = e.target.value;
        if (fieldName === 'amount') {
            value = value.replace(/[^0-9.]/g, '');
            const decimalCount = (value.match(/\./g) || []).length;
            if (decimalCount > 1) return;
        }
        setForm(prev => ({ ...prev, [fieldName]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!selectedCampaign) {
                setError("Please select a campaign");
                return;
            }

            if (!form.description || form.description.trim().length < 10) {
                setError("Please provide a detailed description (minimum 10 characters)");
                return;
            }

            if (!form.amount || parseFloat(form.amount) <= 0) {
                setError("Please enter a valid amount greater than 0");
                return;
            }

            if (!ethers.utils.isAddress(form.recipient)) {
                setError("Please enter a valid recipient address");
                return;
            }

            // Convert amount to Wei
            const amountInWei = ethers.utils.parseEther(form.amount);
            const maxAmount = selectedCampaign.amountCollected.mul(50).div(100); // 50% of balance

            if (amountInWei.gt(maxAmount)) {
                setError(`Amount cannot exceed 50% of campaign balance (${ethers.utils.formatEther(maxAmount)} ETH)`);
                return;
            }

            if (amountInWei.gt(selectedCampaign.amountCollected)) {
                setError("Amount cannot exceed campaign balance");
                return;
            }

            // Check if campaign is suspended
            if (selectedCampaign.isSuspended) {
                setError("Cannot create withdrawal request for a suspended campaign");
                return;
            }

            // Check if campaign has ended
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime > parseInt(selectedCampaign.deadline.toString())) {
                setError("Cannot create withdrawal request for an ended campaign");
                return;
            }

            console.log("Creating withdrawal request with params:", {
                campaignId: form.campaignId,
                description: form.description,
                amount: amountInWei.toString(),
                recipient: form.recipient
            });

            try {
                const result = await createWithdrawRequest(
                    form.campaignId,
                    form.description,
                    amountInWei,
                    form.recipient
                );

                if (result.success) {
                    // Show success message
                    setError('');
                    alert('Withdrawal request created successfully!');
                    
                    // Navigate to withdrawal requests page for this campaign
                    navigate(`/campaign/${form.campaignId}/withdraw`);
                } else {
                    setError(result.error || "Failed to create withdrawal request");
                }
            } catch (error) {
                console.error("Error creating withdrawal request:", error);
                
                // Handle specific error messages
                if (error.message?.includes("cooldown period")) {
                    setError("Must wait for cooldown period before creating another request");
                } else if (error.message?.includes("maximum withdrawal limit")) {
                    setError("Amount exceeds maximum withdrawal limit (50% of current balance)");
                } else if (error.message?.includes("campaign not active")) {
                    setError("Campaign is not active");
                } else if (error.message?.includes("not owner")) {
                    setError("Only campaign owner can create withdrawal requests");
                } else {
                    setError(error.message || "Failed to create withdrawal request. Please ensure all conditions are met.");
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[var(--background)] flex-1 min-h-screen">
            <div className="flex justify-center items-start p-4 sm:p-8">
                <div className="flex justify-center items-center flex-col bg-[var(--card)] rounded-[10px] sm:w-[600px] w-full p-4 sm:p-8">
                    {/* Wallet Status */}
                    <div className="w-full flex justify-end mb-4">
                        {address ? (
                            <div className="flex items-center gap-2 bg-[var(--secondary)] px-4 py-2 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                                <p className="font-epilogue text-[14px] text-[var(--text)]">Wallet Connected</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-[var(--secondary)] px-4 py-2 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-[var(--error)]"></span>
                                <p className="font-epilogue text-[14px] text-[var(--text)]">⚠️ Please connect wallet</p>
                            </div>
                        )}
                    </div>

                    <h1 className="font-epilogue font-bold text-[28px] text-[var(--text)] text-center mb-8">
                        Create Withdrawal Request
                    </h1>

                    {!address ? (
                        <div className="text-center py-8">
                            <p className="font-epilogue text-[16px] text-[var(--text)]">
                                Please connect your wallet to create withdrawal requests
                            </p>
                        </div>
                    ) : userCampaigns.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="font-epilogue text-[16px] text-[var(--text)]">
                                You don't have any active campaigns to create withdrawal requests for
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                            <FormField 
                                labelName="Select Campaign *"
                                placeholder="Choose your campaign"
                                inputType="select"
                                value={form.campaignId}
                                handleChange={(e) => handleCampaignSelect(e.target.value)}
                                options={userCampaigns.map(campaign => ({
                                    value: campaign.pId.toString(),
                                    label: campaign.title
                                }))}
                            />

                            {selectedCampaign && (
                                <div className="bg-[var(--background)] p-4 rounded-[10px] border border-[var(--border)]">
                                    <h3 className="font-epilogue font-semibold text-[16px] text-[var(--text)] mb-2">
                                        Campaign Details
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-epilogue text-[14px] text-[var(--subtext)]">Balance</span>
                                            <span className="font-epilogue text-[14px] text-[var(--text)]">
                                                {ethers.utils.formatEther(selectedCampaign.amountCollected.toString())} ETH
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-epilogue text-[14px] text-[var(--subtext)]">Max Withdrawal</span>
                                            <span className="font-epilogue text-[14px] text-[var(--success)]">
                                                {ethers.utils.formatEther(selectedCampaign.amountCollected.mul(50).div(100).toString())} ETH
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <FormField 
                                labelName="Description *"
                                placeholder="Purpose of withdrawal"
                                isTextArea
                                value={form.description}
                                handleChange={(e) => handleFormFieldChange('description', e)}
                            />

                            <FormField 
                                labelName="Amount (ETH) *"
                                placeholder="0.1"
                                inputType="text"
                                value={form.amount}
                                handleChange={(e) => handleFormFieldChange('amount', e)}
                            />

                            <FormField 
                                labelName="Recipient Address *"
                                placeholder="0x..."
                                inputType="text"
                                value={form.recipient}
                                handleChange={(e) => handleFormFieldChange('recipient', e)}
                            />

                            {error && (
                                <div className="bg-[var(--error)]/10 border border-[var(--error)] text-[var(--error)] p-4 rounded-[10px]">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center items-center mt-4">
                                <CustomButton 
                                    btnType="submit"
                                    title="Create Request"
                                    styles="bg-[var(--accent)] hover:bg-[var(--accent)]/90 transition-colors"
                                />
                            </div>
                        </form>
                    )}

                    {isLoading && <Loader />}
                </div>
            </div>
        </div>
    );
};

export default CreateWithdrawRequest;