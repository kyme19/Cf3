import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { CustomButton, Loader } from '../components';
import toast from 'react-hot-toast';

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
        finalizeRequest,
        demoMode,
        createWithdrawRequest
    } = useStateContext();
  
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({ type: null, requestId: null });
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState(null);
    const [withdrawRequests, setWithdrawRequests] = useState([]);

    const fetchData = async () => {
        if (!contract || !id || !address) return;

        try {
            setIsLoading(true);
            const campaigns = await getCampaigns();
            const currentCampaign = campaigns.find(c => c.pId.toString() === id);
            
            if (!currentCampaign) {
                setError("Campaign not found");
                return;
            }

            setCampaign(currentCampaign);
            const requests = await getWithdrawRequests(id);
            setWithdrawRequests(requests);
            setError('');
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load campaign details");
            setError("Failed to load campaign details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [contract, id, address]);

    const handleApprove = async (requestId) => {
        try {
            setActionLoading({ type: 'approve', requestId });
            
            if (demoMode) {
                // Update local state immediately
                setWithdrawRequests(prev => prev.map(req => {
                    if (req.id === requestId) {
                        return {
                            ...req,
                            approvalCount: req.approvalCount + 1,
                            hasVoted: true
                        };
                    }
                    return req;
                }));
                toast.success("Request approved successfully!");
            } else {
                const response = await approveRequest(id, requestId);
                if (response.success) {
                    toast.success("Request approved successfully!");
                    await fetchData(); // Refresh data for real transactions
                } else {
                    throw new Error(response.error || "Failed to approve request");
                }
            }
        } catch (error) {
            console.error("Error in handleApprove:", error);
            toast.error(error.message || "Failed to approve request");
        } finally {
            setActionLoading({ type: null, requestId: null });
        }
    };

    const handleFinalize = async (requestId) => {
        try {
            setActionLoading({ type: 'finalize', requestId });
            
            if (demoMode) {
                // Update local state immediately
                setWithdrawRequests(prev => prev.map(req => {
                    if (req.id === requestId) {
                        return {
                            ...req,
                            completed: true
                        };
                    }
                    return req;
                }));
                toast.success("Request finalized successfully!");
            } else {
                const response = await finalizeRequest(id, requestId);
                if (response.success) {
                    toast.success("Request finalized successfully!");
                    await fetchData(); // Refresh data for real transactions
                } else {
                    throw new Error(response.error || "Failed to finalize request");
                }
            }
        } catch (error) {
            console.error("Error in handleFinalize:", error);
            toast.error(error.message || "Failed to finalize request");
        } finally {
            setActionLoading({ type: null, requestId: null });
        }
    };

    const handleCreateRequest = () => {
        navigate(`/campaign/${id}/withdraw/create`);
    };

    if (!address) {
        return (
            <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
                <p className="font-epilogue font-semibold text-[16px] leading-[30px] text-white">
                    Please connect your wallet to view withdrawal requests.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
                <p className="font-epilogue font-semibold text-[16px] leading-[30px] text-white">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
            <div className="flex flex-col gap-[30px]">
                <div className="flex justify-between items-center">
                    <h1 className="font-epilogue font-semibold text-[18px] text-white dark:text-white text-gray-900 uppercase">
                        Withdrawal Requests ({withdrawRequests.length})
                    </h1>
                    {campaign && campaign.owner.toLowerCase() === address.toLowerCase() && (
                        <CustomButton 
                            btnType="button"
                            title="Create Request"
                            styles="bg-[#8c6dfd]"
                            handleClick={handleCreateRequest}
                        />
                    )}
                </div>

                <div className="overflow-x-auto rounded-[10px] border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-[#1c1c24]">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount (ETH)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Approval Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                                        No withdrawal requests found
                                    </td>
                                </tr>
                            ) : (
                                withdrawRequests.map((request, i) => (
                                    <tr key={i} className={`border-b border-gray-200 dark:border-gray-700 ${request.completed ? 'opacity-50 bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{i}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{request.recipient}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {request.approvalCount}/{campaign?.donatorCount || 2}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {!request.completed && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={actionLoading.type === 'approve' && actionLoading.requestId === request.id || request.hasVoted}
                                                        className={`px-4 py-2 rounded-md text-white transition-all duration-200 ${
                                                            request.hasVoted
                                                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                                                : actionLoading.type === 'approve' && actionLoading.requestId === request.id
                                                                ? 'bg-[#1dc071] opacity-75 cursor-wait'
                                                                : 'bg-[#1dc071] hover:bg-[#1db071] hover:shadow-md'
                                                        }`}
                                                    >
                                                        {actionLoading.type === 'approve' && actionLoading.requestId === request.id
                                                            ? 'Approving...'
                                                            : request.hasVoted 
                                                            ? 'Approved' 
                                                            : 'Approve'}
                                                    </button>
                                                    {campaign && campaign.owner.toLowerCase() === address.toLowerCase() && 
                                                     request.approvalCount > (campaign.donatorCount || 2) / 2 && (
                                                        <button
                                                            onClick={() => handleFinalize(request.id)}
                                                            disabled={actionLoading.type === 'finalize' && actionLoading.requestId === request.id}
                                                            className={`px-4 py-2 rounded-md text-white transition-all duration-200 ${
                                                                actionLoading.type === 'finalize' && actionLoading.requestId === request.id
                                                                    ? 'bg-[#8c6dfd] opacity-75 cursor-wait'
                                                                    : 'bg-[#8c6dfd] hover:bg-[#7c5dfd] hover:shadow-md'
                                                            }`}
                                                        >
                                                            {actionLoading.type === 'finalize' && actionLoading.requestId === request.id
                                                                ? 'Finalizing...'
                                                                : 'Finalize'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {request.completed && (
                                                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WithdrawRequest;