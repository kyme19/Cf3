import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { CustomButton, Loader } from '../components';

const WithdrawRequest = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { 
        address, 
        contract, 
        getDonations, 
        getCampaigns, 
        getWithdrawRequests,
        approveRequest,
        finalizeRequest 
    } = useStateContext();
  
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState(null);
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let mounted = true;
        let retryCount = 0;
        const maxRetries = 3;

        const fetchData = async () => {
            if (!contract || !id || !address) return;

            try {
                const campaigns = await getCampaigns();
                const currentCampaign = campaigns.find(c => c.pId.toString() === id);
                
                if (!currentCampaign) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(fetchData, 1000); // Retry after 1 second
                        return;
                    }
                    if (mounted) setError("Campaign not found");
                    return;
                }

                if (mounted) {
                    setCampaign(currentCampaign);
                    const requests = await getWithdrawRequests(id);
                    setWithdrawRequests(requests);
                    setError('');
                }
            } catch (error) {
                if (mounted) {
                    console.error("Error fetching data:", error);
                    setError("Failed to load campaign details");
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        setIsLoading(true);
        fetchData();

        return () => {
            mounted = false;
        };
    }, [contract, id, address, getCampaigns, getWithdrawRequests, refreshKey]);

    const handleApprove = async (requestId) => {
        if (actionInProgress) return;
        
        try {
            setActionInProgress(true);
            await approveRequest(id, requestId);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error("Error approving request:", error);
            setError("Failed to approve request");
        } finally {
            setActionInProgress(false);
        }
    };

    const handleFinalize = async (requestId) => {
        if (actionInProgress) return;
        
        try {
            setActionInProgress(true);
            await finalizeRequest(id, requestId);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error("Error finalizing request:", error);
            setError("Failed to finalize request");
        } finally {
            setActionInProgress(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const shortenAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!address) {
        return (
            <div className="bg-[var(--card)] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
                <p className="font-epilogue font-semibold text-[16px] leading-[30px] text-[var(--text)]">
                    Please connect your wallet to view withdrawal requests.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-secondary)] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
            {/* Wallet Status */}
            <div className="w-full flex justify-end mb-4">
                {address ? (
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1dc071]"></span>
                        <p className="font-epilogue text-[14px] text-[var(--text)]">Wallet Connected</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff0000]"></span>
                        <p className="font-epilogue text-[14px] text-[var(--text)]">⚠️ Please connect wallet to continue</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[var(--card)] rounded-[10px]">
                <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-[var(--text)]">Withdrawal Requests</h1>
            </div>

            {error ? (
                <div className="mt-[20px] p-4 bg-red-100 dark:bg-red-900 rounded-[10px]">
                    <p className="font-epilogue text-red-600 dark:text-red-200">{error}</p>
                </div>
            ) : !campaign ? (
                <div className="mt-[65px] flex flex-col items-center">
                    <p className="font-epilogue text-[16px] text-[var(--text)]">No withdrawal requests have been made yet. Check back later!</p>
                </div>
            ) : (
                <>
                    {/* Campaign Details */}
                    <div className="w-full bg-[var(--card)] rounded-[10px] mt-[20px] p-4">
                        <h2 className="font-epilogue font-semibold text-[18px] text-[var(--text)]">{campaign.title}</h2>
                        <div className="mt-[20px] flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="font-epilogue text-[14px] text-[var(--subtext)]">Campaign Balance</span>
                                <span className="font-epilogue text-[16px] text-[var(--text)]">
                                    {ethers.utils.formatEther(campaign.amountCollected)} ETH
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-epilogue text-[14px] text-[var(--subtext)]">Campaign Owner</span>
                                <span className="font-epilogue text-[14px] text-[var(--text)]">
                                    {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-epilogue text-[14px] text-[var(--subtext)]">Status</span>
                                <span className={`font-epilogue text-[14px] ${campaign.isRefunded ? 'text-red-500' : 'text-green-500'}`}>
                                    {campaign.isRefunded ? 'Refunded' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Requests Table */}
                    {withdrawRequests.length === 0 ? (
                        <div className="mt-[20px] w-full bg-[var(--card)] rounded-[10px] p-4">
                            <p className="font-epilogue text-center text-[16px] text-[var(--text)]">No withdrawal requests yet</p>
                        </div>
                    ) : (
                        <div className="mt-[20px] w-full overflow-x-auto">
                            <table className="w-full bg-[var(--card)] rounded-[10px]">
                                <thead className="border-b border-[var(--border)]">
                                    <tr>
                                        <th className="p-4 text-left font-epilogue text-[14px] text-[var(--text)]">ID</th>
                                        <th className="p-4 text-left font-epilogue text-[14px] text-[var(--text)]">Description</th>
                                        <th className="p-4 text-left font-epilogue text-[14px] text-[var(--text)]">Amount</th>
                                        <th className="p-4 text-left font-epilogue text-[14px] text-[var(--text)]">Recipient</th>
                                        <th className="p-4 text-left font-epilogue text-[14px] text-[var(--text)]">Status</th>
                                        <th className="p-4 text-left font-epilogue text-[14px] text-[var(--text)]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawRequests.map((request, index) => (
                                        <tr key={index} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]">
                                            <td className="p-4 font-epilogue text-[14px] text-[var(--text)]">{request.id.toString()}</td>
                                            <td className="p-4 font-epilogue text-[14px] text-[var(--text)]">{request.description}</td>
                                            <td className="p-4 font-epilogue text-[14px] text-[var(--text)]">
                                                {ethers.utils.formatEther(request.amount)} ETH
                                            </td>
                                            <td className="p-4 font-epilogue text-[14px] text-[var(--text)]">
                                                {`${request.recipient.slice(0, 6)}...${request.recipient.slice(-4)}`}
                                            </td>
                                            <td className="p-4 font-epilogue text-[14px]">
                                                {request.complete ? (
                                                    <span className="text-green-500">Completed</span>
                                                ) : request.approvalCount >= campaign.donatorCount / 2 ? (
                                                    <span className="text-yellow-500">Ready to Finalize</span>
                                                ) : (
                                                    <span className="text-[var(--text)]">
                                                        {request.approvalCount} / {campaign.donatorCount} Approvals
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {!request.complete && (
                                                    <div className="flex gap-2">
                                                        {!request.approvers[address] && (
                                                            <CustomButton 
                                                                btnType="button"
                                                                title="Approve"
                                                                styles={`bg-[#1dc071] ${actionInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                handleClick={() => handleApprove(request.id)}
                                                                disabled={actionInProgress}
                                                            />
                                                        )}
                                                        {campaign.owner.toLowerCase() === address.toLowerCase() && 
                                                         request.approvalCount >= campaign.donatorCount / 2 && (
                                                            <CustomButton 
                                                                btnType="button"
                                                                title="Finalize"
                                                                styles={`bg-[#8c6dfd] ${actionInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                handleClick={() => handleFinalize(request.id)}
                                                                disabled={actionInProgress}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WithdrawRequest;