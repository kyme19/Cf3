import React, { useState, useEffect, useRef } from 'react';
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
import CampaignInsights from '../components/CampaignInsights';
import { useStateContext } from '../context';
import { useTheme } from '../context/ThemeContext';
import { daysLeft, calculateBarPercentage } from '../utils';
import { ethers } from 'ethers';

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
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'year', 'all'
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
      if (data.length > 0) {
        setSelectedCampaign(data[0]);
        prepareChartData(data[0]);
      }
    } catch (error) {
      console.log("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEth = (value) => {
    if (!value) return '0.00';
    try {
      const ethValue = ethers.utils.formatEther(value.toString());
      return parseFloat(ethValue).toFixed(2);
    } catch (error) {
      console.error('Error formatting ETH value:', error);
      return '0.00';
    }
  };

  const prepareChartData = (campaign) => {
    if (!campaign) return;

    const now = new Date();
    const startDate = new Date(campaign.deadline * 1000 - 30 * 24 * 60 * 60 * 1000);
    const dates = [];
    const amounts = [];
    const targetAmounts = [];
    const projectedAmounts = [];

    let currentAmount = 0;
    const targetAmount = parseFloat(formatEth(campaign.target));
    const collectedAmount = parseFloat(formatEth(campaign.amountCollected));
    const daysTotal = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const dailyRate = collectedAmount / daysTotal;

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      dates.push(d.toLocaleDateString());
      currentAmount = Math.min(currentAmount + dailyRate, collectedAmount);
      amounts.push(currentAmount);
      targetAmounts.push(targetAmount);

      // Calculate projected growth
      const daysLeft = Math.floor((new Date(campaign.deadline * 1000) - d) / (1000 * 60 * 60 * 24));
      const projectedAmount = currentAmount + (dailyRate * daysLeft);
      projectedAmounts.push(Math.min(projectedAmount, targetAmount));
    }

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Amount Collected',
          data: amounts,
          borderColor: '#1dc071',
          backgroundColor: 'rgba(29, 192, 113, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1dc071',
        },
        {
          label: 'Target Amount',
          data: targetAmounts,
          borderColor: '#8c6dfd',
          borderDash: [5, 5],
          fill: false,
          tension: 0,
          pointRadius: 0,
        },
        {
          label: 'Projected Growth',
          data: projectedAmounts,
          borderColor: '#ff7f50',
          backgroundColor: 'rgba(255, 127, 80, 0.1)',
          borderDash: [3, 3],
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }
      ]
    });
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#000',
          font: {
            family: 'Inter',
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? '#2c2c34' : '#fff',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? '#3a3a43' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: 'Inter'
        },
        titleFont: {
          family: 'Inter',
          weight: 600
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ETH`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: isDarkMode ? '#3a3a43' : '#e2e8f0'
        },
        ticks: {
          color: isDarkMode ? '#808191' : '#64748b',
          font: {
            family: 'Inter',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: isDarkMode ? '#3a3a43' : '#e2e8f0',
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#808191' : '#64748b',
          font: {
            family: 'Inter',
            size: 10
          },
          callback: function(value) {
            return value + ' ETH';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CampaignSelector = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center justify-between w-64 px-4 py-2 rounded-lg font-epilogue text-sm transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#2c2c34] text-white hover:bg-[#3a3a43]'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span className="truncate">
          {selectedCampaign ? selectedCampaign.title : 'Select Campaign'}
        </span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform duration-200 ${
            isDropdownOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className={`absolute z-50 w-64 mt-2 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'
        }`}>
          <div className="p-2">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-2 rounded-md font-epilogue text-sm ${
                isDarkMode
                  ? 'bg-[#2c2c34] text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-700 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <button
                  key={campaign.pId}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    prepareChartData(campaign);
                    setIsDropdownOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full px-4 py-2 text-left font-epilogue text-sm transition-all duration-200 ${
                    selectedCampaign?.pId === campaign.pId
                      ? 'bg-[#1dc071] text-white'
                      : isDarkMode
                      ? 'text-white hover:bg-[#2c2c34]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{campaign.title}</span>
                    <span className={`text-xs ${
                      selectedCampaign?.pId === campaign.pId
                        ? 'text-white/80'
                        : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}>
                      {formatEth(campaign.amountCollected)} ETH of {formatEth(campaign.target)} ETH
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className={`px-4 py-2 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No campaigns found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`font-epilogue font-semibold text-[18px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Your Campaigns ({campaigns.length})
        </h1>
        <div className="flex items-center gap-4">
          <CampaignSelector />
          <div className="flex gap-2">
            {['week', 'month', 'year', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-md font-epilogue text-xs transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-[#1dc071] text-white'
                    : isDarkMode
                    ? 'bg-[#2c2c34] text-white hover:bg-[#3a3a43]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`rounded-[20px] ${isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'} p-6 shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`font-epilogue font-semibold text-[16px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Campaign Progress
          </h2>
        </div>
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Campaign Stats */}
      {selectedCampaign && (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6`}>
          <div className={`rounded-[15px] ${isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'} p-6 shadow-lg`}>
            <h3 className={`font-epilogue text-sm ${isDarkMode ? 'text-[#808191]' : 'text-gray-500'} mb-2`}>
              Amount Raised
            </h3>
            <p className={`font-epilogue font-semibold text-2xl ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {formatEth(selectedCampaign.amountCollected)} ETH
            </p>
            <p className={`font-epilogue text-sm ${isDarkMode ? 'text-[#808191]' : 'text-gray-500'} mt-1`}>
              of {formatEth(selectedCampaign.target)} ETH target
            </p>
          </div>
          <div className={`rounded-[15px] ${isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'} p-6 shadow-lg`}>
            <h3 className={`font-epilogue text-sm ${isDarkMode ? 'text-[#808191]' : 'text-gray-500'} mb-2`}>
              Days Remaining
            </h3>
            <p className={`font-epilogue font-semibold text-2xl ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {daysLeft(selectedCampaign.deadline)}
            </p>
            <p className={`font-epilogue text-sm ${isDarkMode ? 'text-[#808191]' : 'text-gray-500'} mt-1`}>
              until deadline
            </p>
          </div>
          <div className={`rounded-[15px] ${isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'} p-6 shadow-lg`}>
            <h3 className={`font-epilogue text-sm ${isDarkMode ? 'text-[#808191]' : 'text-gray-500'} mb-2`}>
              Progress
            </h3>
            <p className={`font-epilogue font-semibold text-2xl ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {calculateBarPercentage(selectedCampaign.target, selectedCampaign.amountCollected)}%
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div
                className="h-full bg-[#1dc071] rounded-full transition-all duration-300"
                style={{
                  width: `${calculateBarPercentage(selectedCampaign.target, selectedCampaign.amountCollected)}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campaign Insights */}
      {selectedCampaign && <CampaignInsights campaigns={[selectedCampaign]} />}
    </div>
  );
};

export default Profile;