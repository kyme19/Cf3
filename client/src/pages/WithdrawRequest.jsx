import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStateContext } from '../context';
import { Loader } from '../components';

const WithdrawRequest = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { address, contract, getDonations, getCampagins, getWithdrawRequests } = useStateContext();
  
    const [isLoading, setIsLoading] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [isDonator, setIsDonator] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [donators, setDonators] = useState([]);
    const [withdrawRequests, setWithdrawRequests] = useState([]);
    const [campaignBalance, setCampaignBalance] = useState({
        eth: '0',
        usd: '0',
        targetReached: false
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getCampagins(id); // Adjusted to use getCampagins
                
                if (!data) {
                    setError("Campaign not found");
                    return;
                }

                const campaignDonations = await getDonations(id);
                const requests = await getWithdrawRequests(id);
                
                const uniqueDonators = [...new Set(campaignDonations.map(d => d.donator))];
                const userIsDonator = uniqueDonators.some(
                    donator => donator.toLowerCase() === address?.toLowerCase()
                );
                const userIsCreator = data.owner.toLowerCase() === address?.toLowerCase();
                
                setCampaign(data);
                setDonators(uniqueDonators);
                setIsDonator(userIsDonator);
                setIsCreator(userIsCreator);
                setWithdrawRequests(requests);
                
                const targetReached = Number(data.amountCollected) >= Number(data.target);
                setCampaignBalance({
                    eth: data.amountCollected,
                    usd: (Number(data.amountCollected) * 3000).toFixed(2),
                    targetReached
                });

            } catch (error) {
                console.error("Error fetching campaign details:", error);
                setError("Error loading campaign details");
            } finally {
                setIsLoading(false);
            }
        };

        if(contract && id) fetchCampaignDetails();
    }, [contract, address, id]);

    const RequestRow = ({ request }) => (
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors">
            <span className="text-[var(--text)]">{request.id}</span>
            <span className="text-[var(--text)] truncate">{request.description}</span>
            <span className="text-[var(--text)]">{request.amount} ETH</span>
            <span className="text-[var(--text)] truncate">{request.recipient}</span>
            <span className="text-[var(--text)]">{request.approvalCount} / {donators.length}</span>
            <span className="text-[var(--text)]">{new Date(request.created * 1000).toLocaleDateString()}</span>
            <div className="flex gap-2">
                {isDonator && !request.approved && (
                    <button 
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1 bg-[var(--accent)] text-white rounded hover:opacity-90"
                    >
                        Approve
                    </button>
                )}
                {isCreator && request.approvalCount >= donators.length / 2 && !request.finalized && (
                    <button 
                        onClick={() => handleFinalize(request.id)}
                        className="px-3 py-1 bg-[#8c6dfd] text-white rounded hover:opacity-90"
                    >
                        Finalize
                    </button>
                )}
            </div>
        </div>
    );

    if (isLoading) return <Loader />;

    return (
        <div className="bg-[var(--background)] min-h-screen p-6">
            {error ? (
                <div className="bg-[var(--card)] rounded-[15px] p-4 mb-6 text-center">
                    <p className="text-[var(--text)] text-xl mb-4">{error}</p>
                    <Link to="/" className="text-[var(--accent)] hover:opacity-90">
                        ← Back to Campaigns
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-[var(--card)] rounded-[15px] p-4 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[var(--text)] text-xl font-bold">
                                {campaign?.title}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-[var(--text)]">Balance:</span>
                                <span className="text-[var(--accent)] font-bold">{campaignBalance.eth} ETH</span>
                                <span className="text-[var(--subtext)]">(${campaignBalance.usd})</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className={`px-4 py-2 rounded-lg ${campaignBalance.targetReached ? 'bg-[#1dc071]/10' : 'bg-[#ff8a00]/10'}`}>
                                <span className={campaignBalance.targetReached ? 'text-[#1dc071]' : 'text-[#ff8a00]'}>{campaignBalance.targetReached ? '✓ Target Reached' : '⚠ Target Not Reached'}</span>
                            </div>
                            {isDonator && (
                                <div className="px-4 py-2 rounded-lg bg-[#1dc071]/10">
                                    <span className="text-[#1dc071]">You are a donator</span>
                                </div>
                            )}
                            {isCreator && (
                                <div className="px-4 py-2 rounded-lg bg-[#8c6dfd]/10">
                                    <span className="text-[#8c6dfd]">You are the creator</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--card)] rounded-xl overflow-hidden">
                        <div className="grid grid-cols-7 gap-4 p-4 bg-[var(--secondary)] text-[var(--subtext)]">
                            <span>ID</span>
                            <span>Description</span>
                            <span>Amount</span>
                            <span>Recipient</span>
                            <span>Approvals</span>
                            <span>Created</span>
                            <span>Actions</span>
                        </div>

                        {withdrawRequests.length > 0 ? (
                            withdrawRequests.map((request) => (
                                <RequestRow key={request.id} request={request} />
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-[var(--subtext)] mb-4">No withdrawal requests found</p>
                                {!isDonator && !isCreator && (
                                    <div className="text-[var(--subtext)] mt-2">
                                        <p className="mb-2">Want to participate in this campaign?</p>
                                        <Link 
                                            to={`/campaign-details/${id}`}
                                            className="text-[var(--accent)] hover:opacity-90"
                                        >
                                            Donate Now →
                                        </Link>
                                    </div>
                                )}
                                {isDonator && (
                                    <p className="text-[var(--subtext)]">You'll be able to approve withdrawal requests when they're created</p>
                                )}
                            </div>
                        )}
                    </div>

                    {isCreator && (
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={() => navigate(`/campaign/${id}/withdraw/create`)}
                                className="px-6 py-3 bg-[var(--accent)] rounded-lg text-white hover:opacity-90 transition-opacity"
                            >
                                Create Withdrawal Request
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WithdrawRequest;