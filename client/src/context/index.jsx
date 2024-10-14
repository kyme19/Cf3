import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => { 
    const { contract } = useContract('0x3Ad655A0533E4679988155614FAA29Ad6B38A892');
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');
        
    const address = useAddress();
    const connect = useMetamask();

    const publishCampaign = async (form) => {
        try {
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
            console.log("contract call success", data);
            return data;
        } catch (error) {
            console.log("contract call failure", error);
            throw error;
        }
    };

    const getCampagins = async () => {
        try {
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
            console.log("Error fetching campagins:", error);
            return [];
        }
    }

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampagins();
        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
        return filteredCampaigns;
    }
    const donate = async (pId, amount) => {
        const data = await contract.call(
            'donateToCampaign', 
            [pId],
            { value: ethers.utils.parseEther(amount) }
        );
        return data;
    };

    const getDonations = async (pId) => {
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
    }

    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connect,
                createCampaign: publishCampaign,
                getCampagins,
                getUserCampaigns,
                donate,
                getDonations
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);