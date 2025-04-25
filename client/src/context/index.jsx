import React, { useContext, createContext, useState } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { recordTransactionAPI, createCampaignAPI } from '../api';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => { 
    const { contract } = useContract('0xb00b440e2467540b42F8cCbA18D2D66Eb1c72bdD'); 
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
        
    const address = useAddress();
    const connect = useMetamask();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaignStatuses, setCampaignStatuses] = useState({});
    const [simulatedRequests, setSimulatedRequests] = useState({});
    const [simulatedVotes, setSimulatedVotes] = useState({});

    const updateCampaignStatus = (campaignId, status) => {
        setCampaignStatuses(prev => ({
            ...prev,
            [campaignId]: status
        }));
    };

    const publishCampaign = async (form) => {
        if (loading) return;
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

            // Create campaign record in MongoDB
            await createCampaignRecord({
                campaignId: data.receipt.events[0].args.campaignId.toString(),
                title: form.title,
                description: form.description,
                target: form.target,
                deadline: new Date(form.deadline),
                owner: address,
                image: form.image
            });

            // Record the transaction
            await recordTransactionAPI({
                transactionHash: data.receipt.transactionHash,
                campaignId: data.receipt.events[0].args.campaignId.toString(),
                type: 'CAMPAIGN_CREATION',
                from: address,
                to: await contract.getAddress(),
                amount: '0',
                status: 'COMPLETED',
                metadata: {
                    title: form.title,
                    target: form.target,
                    deadline: form.deadline
                }
            });

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
            console.log('Starting donation process:', { pId, amount });
            const data = await contract.call('donateToCampaign', [pId], {
                value: ethers.utils.parseEther(amount)
            });
            
            console.log('Blockchain transaction successful:', data);

            // Record the transaction via API
            try {
                const transactionData = {
                    transactionHash: data.receipt.transactionHash,
                    campaignId: pId.toString(),
                    type: 'DONATION',
                    from: address,
                    to: await contract.getAddress(),
                    amount: amount,
                    status: 'COMPLETED',
                    metadata: {
                        campaignId: pId,
                        donationAmount: amount,
                        donorAddress: address,
                        timestamp: new Date().toISOString(),
                        transactionDetails: {
                            gasUsed: data.receipt.gasUsed.toString(),
                            blockNumber: data.receipt.blockNumber,
                            status: data.receipt.status
                        }
                    }
                };

                await recordTransactionAPI(transactionData);
                console.log('Transaction recorded successfully via API');
                return data;
            } catch (apiError) {
                console.error('API error:', apiError);
                // Continue even if API recording fails
                return data;
            }
        } catch (error) {
            console.error('Contract error:', error);
            if (error?.receipt?.status === 1) {
                return { receipt: error.receipt };
            }
            throw error;
        }
    };

    const getDonations = async (pId) => {
        try {
            const donations = await contract.call('getDonators', [pId]);
            const numberOfDonations = donations[0].length;

            const parsedDonations = [];
            for (let i = 0; i < numberOfDonations; i++) {
                parsedDonations.push({
                    donator: donations[0][i],
                    donation: donations[1][i] // Keep as BigNumber for proper formatting
                });
            }

            return parsedDonations;
        } catch (error) {
            console.error("Error fetching donations:", error);
            return [];
        }
    };

    const createSimulatedWithdrawRequest = async (campaignId, description, amount, recipient) => {
        try {
            // Create a simulated request immediately
            const newRequest = {
                id: Date.now(),
                description,
                amount: ethers.utils.formatEther(amount),
                recipient,
                completed: false,
                approvalCount: 0,
                hasVoted: false,
                voters: {},
                createdAt: Math.floor(Date.now() / 1000)
            };

            // Update the state immediately
            setSimulatedRequests(prev => ({
                ...prev,
                [campaignId]: [...(prev[campaignId] || []), newRequest]
            }));

            return { success: true, data: newRequest };
        } catch (error) {
            console.error("Error creating simulated request:", error);
            return { success: false, error: error.message };
        }
    };

    const getSimulatedWithdrawRequests = async (campaignId) => {
        // Return simulated requests immediately
        return simulatedRequests[campaignId] || [];
    };

    const simulateApproveRequest = async (campaignId, requestId) => {
        try {
            // Update state immediately
            setSimulatedRequests(prev => {
                const campaignRequests = [...(prev[campaignId] || [])];
                const requestIndex = campaignRequests.findIndex(r => r.id === requestId);
                
                if (requestIndex !== -1) {
                    campaignRequests[requestIndex] = {
                        ...campaignRequests[requestIndex],
                        approvalCount: campaignRequests[requestIndex].approvalCount + 1,
                        hasVoted: true,
                        voters: {
                            ...campaignRequests[requestIndex].voters,
                            [address]: true
                        }
                    };
                }

                return {
                    ...prev,
                    [campaignId]: campaignRequests
                };
            });

            return { success: true };
        } catch (error) {
            console.error("Error in simulateApproveRequest:", error);
            return { success: false, error: error.message };
        }
    };

    const simulateFinalizeRequest = async (campaignId, requestId) => {
        try {
            // Update state immediately
            setSimulatedRequests(prev => {
                const campaignRequests = [...(prev[campaignId] || [])];
                const requestIndex = campaignRequests.findIndex(r => r.id === requestId);
                
                if (requestIndex !== -1) {
                    campaignRequests[requestIndex] = {
                        ...campaignRequests[requestIndex],
                        completed: true
                    };
                }

                return {
                    ...prev,
                    [campaignId]: campaignRequests
                };
            });

            return { success: true };
        } catch (error) {
            console.error("Error in simulateFinalizeRequest:", error);
            return { success: false, error: error.message };
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
                createWithdrawRequest: createSimulatedWithdrawRequest,
                getWithdrawRequests: getSimulatedWithdrawRequests,
                approveRequest: simulateApproveRequest,
                finalizeRequest: simulateFinalizeRequest,
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