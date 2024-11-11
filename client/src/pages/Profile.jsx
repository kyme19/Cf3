import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { DisplayCampaigns } from '../components';
import CampaignInsights from '../components/CampaignInsights'; // Updated import
import { useStateContext } from '../context';
import { useTheme } from '../context/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const { address, contract, getUserCampaigns } = useStateContext();
  const { isDarkMode } = useTheme();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getUserCampaigns();
      setCampaigns(data);
      prepareChartData(data);
    } catch (error) {
      console.log("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (campaignData) => {
    const labels = campaignData.map(campaign => campaign.title);
    const amountCollected = campaignData.map(campaign => 
      parseFloat(campaign.amountCollected)
    );
    const targetAmounts = campaignData.map(campaign => 
      parseFloat(campaign.target)
    );

    setChartData({
      labels,
      datasets: [
        {
          label: 'Amount Collected',
          data: amountCollected,
          borderColor: '#1dc071',
          backgroundColor: 'rgba(29, 192, 113, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#1dc071',
        },
        {
          label: 'Target Amount',
          data: targetAmounts,
          borderColor: '#8c6dfd',
          backgroundColor: 'rgba(140, 109, 253, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#8c6dfd',
        }
      ]
    });
  };

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? 'white' : 'black', // Adjusted for dark mode
          font: {
            family: 'epilogue',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--card)',
        titleColor: 'var(--text)',
        bodyColor: 'var(--text)',
        borderColor: 'var(--border)',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: 'epilogue'
        },
        titleFont: {
          family: 'epilogue'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--border)',
          drawBorder: false,
        },
        ticks: {
          color: isDarkMode ? 'white' : 'black', // Adjusted for dark mode
          font: {
            family: 'epilogue'
          }
        }
      },
      x: {
        grid: {
          color: 'var(--border)',
          drawBorder: false,
        },
        ticks: {
          color: isDarkMode ? 'white' : 'black', // Adjusted for dark mode
          font: {
            family: 'epilogue'
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      {/* Profile Header */}
      <div className="bg-[var(--card)] rounded-[15px] p-6 shadow-lg">
        <h1 className="font-epilogue font-bold text-[28px] text-[var(--text)]">
          Your Profile ✨
        </h1>
        <p className="font-epilogue text-[16px] text-[var(--subtext)] mt-2">
          View and manage your campaigns
        </p>
      </div>

      {/* Metrics Chart Section */}
      {campaigns.length > 0 && (
        <div className="bg-[var(--card)] rounded-[15px] p-6 shadow-lg">
          <h2 className="font-epilogue font-semibold text-[20px] text-[var(--text)] mb-6">
            Campaign Metrics 📊
          </h2>
          <div className="w-full h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {campaigns.length > 0 && (
        <CampaignInsights campaigns={campaigns} />
      )}

      {/* Campaigns List Section */}
      <div className="bg-[var(--card)] rounded-[15px] p-6 shadow-lg">
        <DisplayCampaigns 
          title="Your Campaigns 🚀"
          isLoading={isLoading} 
          campaigns={campaigns}    
        />
      </div>
    </div>
  );
};

export default Profile;