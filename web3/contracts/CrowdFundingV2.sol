// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFundingV2 {
    struct WithdrawRequest {
        string description;
        uint256 amount;
        address payable recipient;
        bool completed;
        uint256 approvalCount;
        uint256 createdAt;
        mapping(address => bool) voters;
    }

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        uint256 withdrawRequestCount;
        mapping(uint256 => WithdrawRequest) withdrawRequests;
        uint256 lastWithdrawRequestTime;
        bool isRefunded;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    // Constants for withdrawal rules
    uint256 constant public WITHDRAWAL_COOLDOWN = 1 days;
    uint256 constant public MAX_WITHDRAWAL_PERCENT = 50; // 50% of current balance

    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event WithdrawRequestCreated(uint256 indexed campaignId, uint256 indexed requestId, string description);
    event WithdrawRequestApproved(uint256 indexed campaignId, uint256 indexed requestId, address indexed voter);
    event WithdrawRequestFinalized(uint256 indexed campaignId, uint256 indexed requestId, uint256 amount);
    event CampaignRefunded(uint256 indexed campaignId, uint256 totalAmountRefunded);
    event RefundSent(uint256 indexed campaignId, address indexed donor, uint256 amount);

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        _;
    }

    modifier onlyCampaignOwner(uint256 _campaignId) {
        require(campaigns[_campaignId].owner == msg.sender, "Only campaign owner can perform this action");
        _;
    }

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target amount must be greater than 0");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.withdrawRequestCount = 0;
        campaign.lastWithdrawRequestTime = 0;
        campaign.isRefunded = false;

        emit CampaignCreated(numberOfCampaigns, _owner, _title);
        
        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable campaignExists(_id) {
        require(msg.value > 0, "Donation amount must be greater than 0");
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.deadline, "Campaign has ended");
        require(!campaign.isRefunded, "Campaign has been refunded");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    function createWithdrawRequest(
        uint256 _campaignId,
        string memory _description,
        uint256 _amount,
        address payable _recipient
    ) public campaignExists(_campaignId) onlyCampaignOwner(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.isRefunded, "Campaign has been refunded");
        require(block.timestamp >= campaign.lastWithdrawRequestTime + WITHDRAWAL_COOLDOWN, 
                "Must wait for cooldown period");
        require(_amount <= (campaign.amountCollected * MAX_WITHDRAWAL_PERCENT) / 100, 
                "Amount exceeds maximum withdrawal limit");
        require(_amount <= address(this).balance, "Insufficient contract balance");

        WithdrawRequest storage request = campaign.withdrawRequests[campaign.withdrawRequestCount];
        request.description = _description;
        request.amount = _amount;
        request.recipient = _recipient;
        request.completed = false;
        request.approvalCount = 0;
        request.createdAt = block.timestamp;

        campaign.lastWithdrawRequestTime = block.timestamp;
        campaign.withdrawRequestCount++;

        emit WithdrawRequestCreated(_campaignId, campaign.withdrawRequestCount - 1, _description);
    }

    function approveRequest(uint256 _campaignId, uint256 _requestId) 
        public campaignExists(_campaignId) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(_requestId < campaign.withdrawRequestCount, "Request does not exist");
        
        WithdrawRequest storage request = campaign.withdrawRequests[_requestId];
        require(!request.completed, "Request has been completed");
        require(!request.voters[msg.sender], "You have already voted");
        
        // Check if sender is a donator
        bool isDonator = false;
        for(uint i = 0; i < campaign.donators.length; i++) {
            if(campaign.donators[i] == msg.sender) {
                isDonator = true;
                break;
            }
        }
        require(isDonator, "Only donators can approve");

        request.voters[msg.sender] = true;
        request.approvalCount++;

        emit WithdrawRequestApproved(_campaignId, _requestId, msg.sender);
    }

    function finalizeRequest(uint256 _campaignId, uint256 _requestId) 
        public campaignExists(_campaignId) 
        onlyCampaignOwner(_campaignId) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(_requestId < campaign.withdrawRequestCount, "Request does not exist");
        
        WithdrawRequest storage request = campaign.withdrawRequests[_requestId];
        require(!request.completed, "Request has already been completed");
        require(request.approvalCount >= campaign.donators.length * 3 / 4, 
                "Not enough approvals");

        request.completed = true;
        (bool sent, ) = request.recipient.call{value: request.amount}("");
        require(sent, "Failed to send Ether");

        campaign.amountCollected -= request.amount;

        emit WithdrawRequestFinalized(_campaignId, _requestId, request.amount);
    }

    function getDonators(uint256 _id) public view campaignExists(_id) 
        returns (address[] memory, uint256[] memory) 
    {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (
        address[] memory owners,
        string[] memory titles,
        string[] memory descriptions,
        uint256[] memory targets,
        uint256[] memory deadlines,
        uint256[] memory amountCollecteds,
        string[] memory images,
        bool[] memory isRefunded
    ) {
        owners = new address[](numberOfCampaigns);
        titles = new string[](numberOfCampaigns);
        descriptions = new string[](numberOfCampaigns);
        targets = new uint256[](numberOfCampaigns);
        deadlines = new uint256[](numberOfCampaigns);
        amountCollecteds = new uint256[](numberOfCampaigns);
        images = new string[](numberOfCampaigns);
        isRefunded = new bool[](numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage campaign = campaigns[i];
            owners[i] = campaign.owner;
            titles[i] = campaign.title;
            descriptions[i] = campaign.description;
            targets[i] = campaign.target;
            deadlines[i] = campaign.deadline;
            amountCollecteds[i] = campaign.amountCollected;
            images[i] = campaign.image;
            isRefunded[i] = campaign.isRefunded;
        }

        return (owners, titles, descriptions, targets, deadlines, amountCollecteds, images, isRefunded);
    }

    function getWithdrawRequests(uint256 _campaignId) public view campaignExists(_campaignId)
        returns (
            string[] memory descriptions,
            uint256[] memory amounts,
            address[] memory recipients,
            bool[] memory completedStates,
            uint256[] memory approvalCounts,
            uint256[] memory createdAts
        )
    {
        Campaign storage campaign = campaigns[_campaignId];
        uint256 requestCount = campaign.withdrawRequestCount;
        
        descriptions = new string[](requestCount);
        amounts = new uint256[](requestCount);
        recipients = new address[](requestCount);
        completedStates = new bool[](requestCount);
        approvalCounts = new uint256[](requestCount);
        createdAts = new uint256[](requestCount);

        for(uint i = 0; i < requestCount; i++) {
            WithdrawRequest storage request = campaign.withdrawRequests[i];
            descriptions[i] = request.description;
            amounts[i] = request.amount;
            recipients[i] = request.recipient;
            completedStates[i] = request.completed;
            approvalCounts[i] = request.approvalCount;
            createdAts[i] = request.createdAt;
        }

        return (descriptions, amounts, recipients, completedStates, approvalCounts, createdAts);
    }

    function hasVoted(uint256 _campaignId, uint256 _requestId, address _voter) 
        public view campaignExists(_campaignId) 
        returns (bool) 
    {
        return campaigns[_campaignId].withdrawRequests[_requestId].voters[_voter];
    }

    function refundAll(uint256 _campaignId) public campaignExists(_campaignId) onlyCampaignOwner(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.isRefunded, "Campaign has already been refunded");
        require(campaign.amountCollected > 0, "No funds to refund");

        uint256 totalRefunded = 0;
        
        // Refund each donator their contribution
        for(uint256 i = 0; i < campaign.donators.length; i++) {
            address payable donator = payable(campaign.donators[i]);
            uint256 amount = campaign.donations[i];
            
            if(amount > 0) {
                (bool sent, ) = donator.call{value: amount}("");
                require(sent, "Failed to send refund");
                totalRefunded += amount;
                emit RefundSent(_campaignId, donator, amount);
            }
        }

        campaign.isRefunded = true;
        campaign.amountCollected = 0;
        emit CampaignRefunded(_campaignId, totalRefunded);
    }

    function isCampaignRefunded(uint256 _campaignId) public view campaignExists(_campaignId) returns (bool) {
        return campaigns[_campaignId].isRefunded;
    }
}
