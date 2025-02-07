const API_BASE_URL = 'http://localhost:5000/api';

export const recordTransactionAPI = async (transactionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Transaction recorded via API:', data);
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const createCampaignAPI = async (campaignData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campaignData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}; 