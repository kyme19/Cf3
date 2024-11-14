import React, { useContext, createContext, useState } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => { 
    const { contract } = useContract('0xb00b440e2467540b42F8cCbA18D2D66Eb1c72bdD'); 
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
        
    const address = useAddress();
    const connect = useMetamask();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaignStatuses, setCampaignStatuses] = useState({});

    const updateCampaignStatus = (campaignId, status) => {
        setCampaignStatuses(prev => ({
            ...prev,
            [campaignId]: status
        }));
    };

    const publishCampaign = async (form) => {
        if (loading) return; // Prevent duplicate submissions
        try {
            setLoading(true);
            const data = await createCampaign({
                args: [
                    address,
                    form.title,
                    form.description,
                    form.target,
                    new Date(form.deadline).getTime(),
                    form.image
                ],
            });
            console.log("Contract call success", data);
            return { success: true, data };
        } catch (error) {
            console.error("Contract call failure", error);
            setError(error.message);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const getCampaigns = async () => {
        try {
            setLoading(true);
            const data = await contract.call('getCampaigns');
            
            const campaigns = [];
            for (let i = 0; i < data.owners.length; i++) {
                const campaign = {
                    owner: data.owners[i],
                    title: data.titles[i],
                    description: data.descriptions[i],
                    target: data.targets[i].toString(),
                    deadline: data.deadlines[i].toNumber(),
                    amountCollected: data.amountCollecteds[i].toString(),
                    image: data.images[i],
                    isRefunded: data.isRefunded[i],
                    isSuspended: campaignStatuses[i]?.isSuspended || false,
                    pId: i
                };
                campaigns.push(campaign);
            }
            
            return campaigns;
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getUserCampaigns = async () => {
        try {
            setLoading(true);
            const allCampaigns = await getCampaigns();
            const filteredCampaigns = allCampaigns.filter((campaign) => 
                campaign.owner.toLowerCase() === address.toLowerCase()
            ).map(campaign => ({
                ...campaign,
                amountCollected: campaign.amountCollected.toString() // Ensure amountCollected is a string
            }));
            return filteredCampaigns;
        } catch (error) {
            console.error("Error fetching user campaigns:", error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const donate = async (pId, amount) => {
        try {
            setLoading(true);
            const campaign = campaignStatuses[pId];
            if (campaign?.isSuspended) {
                throw new Error("Cannot donate to a suspended campaign");
            }
            const data = await contract.call(
                'donateToCampaign', 
                [pId],
                { value: ethers.utils.parseEther(amount) }
            );
            return { success: true, data };
        } catch (error) {
            console.error("Donation error:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getDonations = async (pId) => {
        try {
            setLoading(true);
            const donations = await contract.call('getDonators', [pId]);
            const numberOfDonations = donations[0].length;

            const parsedDonations = [];
            for (let i = 0; i < numberOfDonations; i++) {
                parsedDonations.push({
                    donator: donations[0][i],
                    donation: ethers.utils.formatEther(donations[1][i].toString())
                });
            }
            return parsedDonations;
        } catch (error) {
            console.error("Error fetching donations:", error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const createWithdrawRequest = async (campaignId, description, amount, recipient) => {
        try {
            setLoading(true);
            
            // Validate recipient address
            if (!ethers.utils.isAddress(recipient)) {
                throw new Error("Invalid recipient address");
            }

            // Call the contract
            const data = await contract.call(
                'createWithdrawRequest',
                [
                    campaignId.toString(),
                    description.trim(),
                    amount,
                    recipient
                ]
            );
            
            return { success: true, data };
        } catch (error) {
            console.error("Error creating withdrawal request:", error);
            let errorMessage = "Failed to create withdrawal request. ";
            
            // Parse the error message
            if (error.message.includes("cooldown period")) {
                errorMessage = "Must wait for cooldown period before creating another request.";
            } else if (error.message.includes("maximum withdrawal limit")) {
                errorMessage = "Amount exceeds maximum withdrawal limit (50% of current balance).";
            } else if (error.message.includes("Insufficient")) {
                errorMessage = "Insufficient contract balance.";
            } else if (error.message.includes("Campaign has been refunded")) {
                errorMessage = "Cannot create request for a refunded campaign.";
            } else {
                errorMessage = error.message;
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getWithdrawRequests = async (campaignId) => {
        try {
            setLoading(true);
            const data = await contract.call('getWithdrawRequests', [campaignId]);
            
            const requests = [];
            for (let i = 0; i < data.descriptions.length; i++) {
                // Create base request object
                const request = {
                    id: i,
                    description: data.descriptions[i],
                    amount: ethers.utils.formatEther(data.amounts[i].toString()),
                    recipient: data.recipients[i],
                    completed: data.completedStates[i],
                    approvalCount: data.approvalCounts[i].toNumber(),
                    createdAt: data.createdAts[i].toNumber(),
                    hasVoted: false // Default value
                };

                // Only check hasVoted if user is connected
                if (address) {
                    try {
                        request.hasVoted = await contract.call('hasVoted', [campaignId, i, address]);
                    } catch (error) {
                        console.error(`Error checking vote status for request ${i}:`, error);
                        // Keep default hasVoted value
                    }
                }

                requests.push(request);
            }
            return requests;
        } catch (error) {
            console.error("Error fetching withdrawal requests:", error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (campaignId, requestId) => {
        try {
            setLoading(true);
            const data = await contract.call('approveRequest', [campaignId, requestId]);
            return { success: true, data };
        } catch (error) {
            console.error("Approval error:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const finalizeRequest = async (campaignId, requestId) => {
        try {
            setLoading(true);
            const data = await contract.call('finalizeRequest', [campaignId, requestId]);
            return { success: true, data };
        } catch (error) {
            console.error("Finalization error:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const refundCampaign = async (pId) => {
        try {
            setLoading(true);
            const data = await contract.call('refundAll', [pId]);
            // Update local status
            updateCampaignStatus(pId, { isRefunded: true, isSuspended: false });
            return { success: true, data };
        } catch (error) {
            console.error("Refund error:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const toggleCampaignStatus = async (pId, isSuspended) => {
        try {
            updateCampaignStatus(pId, { isSuspended });
            return { success: true };
        } catch (error) {
            console.error("Status update error:", error);
            setError(error.message);
            throw error;
        }
    };

    const isCampaignRefunded = async (campaignId) => {
        try {
            const isRefunded = await contract.call('isCampaignRefunded', [campaignId]);
            return isRefunded;
        } catch (error) {
            console.error("Error checking refund status:", error);
            setError(error.message);
            return false;
        }
    };

    const clearError = () => setError(null);

    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connect,
                error,
                loading,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations,
                createWithdrawRequest,
                getWithdrawRequests,
                approveRequest,
                finalizeRequest,
                refundCampaign,
                toggleCampaignStatus,
                updateCampaignStatus,
                isCampaignRefunded,
                clearError
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);