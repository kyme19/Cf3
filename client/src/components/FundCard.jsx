import React from 'react'
import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';
import { useTheme } from '../context/ThemeContext';

const FundCard = ({
  owner, 
  title, 
  description, 
  target, 
  deadline, 
  amountCollected, 
  image, 
  handleClick
}) => {
  const remainingDays = daysLeft(deadline);
  const { isDarkMode } = useTheme();

  return (
    <div className='sm:w-[288px] w-full rounded-[15px] bg-[var(--card)] cursor-pointer 
      overflow-hidden hover:shadow-lg transition-all duration-300 border border-[var(--border)]'
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="h-[158px] w-full relative overflow-hidden">
        <img 
          src={image} 
          alt="fund" 
          className='w-full h-full object-cover'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'fallback-image-url.jpg'
          }}
        />
        {/* Gradient overlay that adapts to theme */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t 
          ${isDarkMode 
            ? 'from-[var(--card)] to-transparent' 
            : 'from-[var(--card)]/90 to-transparent'
          }`} 
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col p-4">
        <div className='flex flex-row items-center mb-[18px]'>
          <img 
            src={tagType} 
            alt="tag" 
            className={`w-[17px] h-[17px] object-contain ${isDarkMode ? '' : 'filter invert'}`}
          />
          <p className='ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[var(--subtext)]'>
            Category
          </p>
        </div>

        <div className='block'>
          <h3 className='font-epilogue font-semibold text-[16px] text-[var(--text)] text-left leading-[26px] truncate'>
            {title}
          </h3>
          <p className='mt-[5px] font-epilogue font-normal text-[var(--subtext)] text-left leading-[18px] truncate'>
            {description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className='flex justify-between flex-wrap mt-[15px] gap-2'>
          <div className='flex flex-col'>
            <h4 className='font-epilogue font-semibold text-[14px] text-[var(--text)] leading-[22px]'>
              {amountCollected}
            </h4>
            <p className='mt-[3px] font-epilogue font-normal text-[12px] text-[var(--subtext)] text-left sm:max-w-[120px] truncate'>
              Raised of {target}
            </p>
          </div>
          <div className='flex flex-col'>
            <h4 className='font-epilogue font-semibold text-[14px] text-[var(--text)] leading-[22px]'>
              {remainingDays}
            </h4>
            <p className='mt-[3px] font-epilogue font-normal text-[12px] text-[var(--subtext)] text-left sm:max-w-[120px] truncate'>
              Days Left
            </p>
          </div>
        </div>

        {/* Owner Info */}
        <div className='flex items-center mt-[20px] gap-[12px]'>
          <div className='w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[var(--background)]'>
            <img 
              src={thirdweb} 
              alt="user" 
              className={`w-1/2 h-1/2 object-contain ${isDarkMode ? '' : 'filter invert'}`}
            />
          </div>
          <p className='flex-1 font-epilogue font-normal text-[12px] text-[var(--subtext)] truncate'>
            by <span className='text-[var(--text)]'>{owner}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default FundCard;