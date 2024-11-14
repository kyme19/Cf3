import React from 'react'
import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';
import { useTheme } from '../context/ThemeContext';
import { ethers } from 'ethers';

const FundCard = ({
  owner, 
  title, 
  description, 
  target, 
  deadline, 
  amountCollected, 
  image, 
  handleClick,
  isSuspended,
  isRefunded
}) => {
  const remainingDays = daysLeft(deadline);
  const { isDarkMode } = useTheme();

  const getStatusIndicator = () => {
    if (isRefunded) return {
      emoji: '🔴',
      text: 'Refunded',
      bgColor: 'bg-red-100 dark:bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400'
    };
    if (isSuspended) return {
      emoji: '🟠',
      text: 'Suspended',
      bgColor: 'bg-yellow-100 dark:bg-yellow-500/10',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    };
    return {
      emoji: '🟢',
      text: 'Active',
      bgColor: 'bg-green-100 dark:bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400'
    };
  };

  const status = getStatusIndicator();
  
  // Format ETH values without conversion
  const formatEth = (value) => {
    if (!value) return '0.00';
    try {
      // Convert from Wei to ETH
      const ethValue = ethers.utils.formatEther(value);
      return parseFloat(ethValue).toFixed(2);
    } catch (error) {
      console.error('Error formatting ETH value:', error);
      return '0.00';
    }
  };

  return (
    <div 
      className={`sm:w-[288px] w-full rounded-[15px] bg-[var(--card)] cursor-pointer 
        hover:shadow-lg transition-all duration-300 border border-[var(--border)]`}
      onClick={handleClick}
    >
      <img 
        src={image} 
        alt="fund" 
        className="w-full h-[158px] object-cover rounded-[15px]"
      />

      <div className="flex flex-col p-4">
        {/* Status Badge */}
        <div className={`inline-flex items-center self-start px-3 py-1 rounded-full mb-4 ${status.bgColor} ${status.textColor}`}>
          <span className="mr-1.5">{status.emoji}</span>
          <span className="text-sm font-medium">{status.text}</span>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-[var(--text)] text-left leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[var(--text)] leading-[22px]">
              {formatEth(amountCollected)} ETH
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[var(--subtext)] sm:max-w-[120px] truncate">
              Raised of {formatEth(target)} ETH
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[var(--text)] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[var(--subtext)] sm:max-w-[120px] truncate">
              Days Left
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[var(--secondary)]">
            <img src={thirdweb} alt="user" className="w-1/2 h-1/2 object-contain"/>
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[var(--subtext)] truncate">
            by <span className="text-[var(--text)]">{owner}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default FundCard;