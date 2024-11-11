import React, { useContext, createContext, useState } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => { 
    const { contract } = useContract('0x3Ad655A0533E4679988155614FAA29Ad6B38A892');
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
        
    const address = useAddress();
    const connect = useMetamask();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const publishCampaign = async (form) => {
        try {
            setLoading(true);
            const data = await createCampaign({
                args: [
                    address, // owner
                    form.title,
                    form.description,
                    ethers.utils.parseUnits(form.target, 18),
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

    // Keeping the misspelled function name as it's used in the codebase
    const getCampagins = async () => {
        try {
            setLoading(true);
            const campagins = await contract.call('getCampagins');
            const parsedCampagins = campagins.map((campagin, i) => ({
                owner: campagin.owner,
                title: campagin.title,
                description: campagin.description,
                target: ethers.utils.formatEther(campagin.target.toString()),
                deadline: campagin.deadline.toNumber(),
                amountCollected: ethers.utils.formatEther(campagin.amountCollected.toString()),
                image: campagin.image,
                pId: i,
            }));
            return parsedCampagins;
        } catch (error) {
            console.error("Error fetching campagins:", error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getUserCampaigns = async () => {
        try {
            setLoading(true);
            const allCampaigns = await getCampagins();
            const filteredCampaigns = allCampaigns.filter((campaign) => 
                campaign.owner.toLowerCase() === address.toLowerCase()
            );
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
            const data = await contract.call(
                'donateToCampaign', 
                [pId],
                { value: ethers.utils.parseEther(amount) } // Ensure amount is converted to Wei
            );
            console.log("Donation successful:", data);
            return { success: true, data };
        } catch (error) {
            console.error("Donation error:", error);
            setError(error.message);
            throw error; // Rethrow the error for further handling
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

    // New function to handle withdrawal requests
    const createWithdrawRequest = async (campaignId, description, amount, recipient) => {
        try {
            setLoading(true);
            const parsedAmount = ethers.utils.parseEther(amount.toString());
            const data = await contract.call(
                'createWithdrawRequest',
                [campaignId, description, parsedAmount, recipient]
            );
            return { success: true, data };
        } catch (error) {
            console.error("Withdrawal request error:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Function to get withdrawal requests for a campaign
    const getWithdrawRequests = async (campaignId) => {
        try {
            setLoading(true);
            const requests = await contract.call('getWithdrawRequests', [campaignId]);
            const parsedRequests = requests.map((request, index) => ({
                id: index,
                description: request.description,
                amount: ethers.utils.formatEther(request.amount.toString()),
                recipient: request.recipient,
                completed: request.completed,
                approvalCount: request.approvalCount.toNumber(),
                voters: request.voters
            }));
            return parsedRequests;
        } catch (error) {
            console.error("Error fetching withdrawal requests:", error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Function to approve a withdrawal request
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

    // Function to finalize a withdrawal request
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
                getCampagins,
                getUserCampaigns,
                donate,
                getDonations,
                createWithdrawRequest,
                getWithdrawRequests,
                approveRequest,
                finalizeRequest,
                clearError
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);