const API_BASE_URL = 'http://localhost:5000/api';

export const recordTransactionAPI = async (transactionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const createCampaignAPI = async (campaignData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignData)
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const createUserAPI = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Get all records
export const getTransactions = async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    return await response.json();
};

export const getCampaigns = async () => {
    const response = await fetch(`${API_BASE_URL}/campaigns`);
    return await response.json();
};

export const getUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return await response.json();
}; 