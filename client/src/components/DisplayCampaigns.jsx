import React from 'react'
import { useNavigate } from 'react-router-dom';

import  FundCard  from './FundCard';
import { loader } from '../assets';

const DisplayCampaigns = ({title, isLoading, campaigns}) => {

    const navigate = useNavigate();

    const handleNavigate = (campaign) => {
      navigate(`/campaign-details/${campaign.title}` , { state: campaign });
    }

    // Filter out refunded campaigns as they should not be displayed
    const visibleCampaigns = campaigns.filter(campaign => !campaign.isRefunded);

  return (
    <div>
        <h1 className='font-epilogue font-semibold
         text-[18px] text-[var(--text)] text-left'>{title} ({visibleCampaigns.length}) </h1>
         <div className='flex flex-wrap mt-[20px] gap-[26px]'>
            {isLoading && (
                <img src={loader} alt="loader" className='w-[100px] h-[100px] 
                object-contain' />
            )}

            {!isLoading && visibleCampaigns.length === 0 && (
                <p className='font-epilogue font-semibold text-[14px] 
                leading-[30px] text-[var(--subtext)]'>
                    No campaigns found
                </p>
            )}

            {!isLoading && visibleCampaigns.length > 0 && visibleCampaigns.map
              ((campaign) => <FundCard 
              key={campaign.pId} 
              {...campaign} 
                handleClick={() => handleNavigate(campaign)}
              />
            )}
         </div>
    </div>
  )
}

export default DisplayCampaigns