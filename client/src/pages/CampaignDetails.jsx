import React, { useState, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers'
import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';
import { useTheme } from '../context/ThemeContext';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address } = useStateContext();
  const { isDarkMode } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);

  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {
    const data = await getDonations(state.pId);
    setDonators(data);
  }

  useEffect(() => {
    if(contract) fetchDonators();
  }, [contract, address])

  const handleDonate = async () => {
    setIsLoading(true);
    await donate(state.pId, amount);
    navigate('/');
    setIsLoading(false);
  };

  return (
    <div>
      {isLoading && <Loader />}
      <div className='w-full flex md:flex-row flex-col mt-10 gap-[30px]'>
        <div className='flex-1 flex-col'>
          <img 
            src={state.image} 
            alt="campaign" 
            className='w-full h-[410px] object-cover rounded-xl'
          />
          <div className='relative w-full h-[5px] bg-[var(--border)] mt-2'>
            <div 
              className='absolute h-full bg-[var(--accent)]'
              style={{
                width: `${calculateBarPercentage(state.target, state.amountCollected)}%`,
                maxWidth:'100%'
              }}
            />
          </div>
        </div>
        <div className='flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]'>
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
          <CountBox title="Total backers" value={donators.length} />  
        </div>
      </div>

      <div className='mt-[60px] flex lg:flex-row flex-col gap-5'>
        <div className='flex-[2] flex flex-col gap-[40px]'>
          {/* Creator Section */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] uppercase">
              Creator
            </h4>
            <div className='mt-[20px] flex flex-row items-center flex-wrap gap-[14px]'>
              <div className='w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[var(--secondary)] cursor-pointer'>
                <img 
                  src={thirdweb} 
                  alt="user" 
                  className={`w-[60%] h-[60%] object-contain ${isDarkMode ? '' : 'filter invert'}`}
                />
              </div>
              <div>
                <h4 className='font-epilogue font-semibold text-[14px] text-[var(--text)] break-all'>
                  {state.owner}
                </h4>
                <p className='mt-[4px] font-epilogue font-normal text-[12px] text-[var(--subtext)]'>
                  10 campaigns
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] uppercase">
              Story
            </h4>
            <div className='mt-[20px]'>
              <p className='font-epilogue font-normal text-[16px] text-[var(--subtext)] leading-[26px] text-justify'>
                {state.description}
              </p>
            </div>
          </div>

          {/* Donators Section */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] uppercase">
              Donators
            </h4>
            <div className='mt-[20px] flex flex-col gap-4'>
              {donators.length > 0 ? donators.map((item, index) => (
                <div key={`${item.donator}-${index}`} className='flex justify-between items-center gap-4'>
                  <p className='font-epilogue font-normal text-[var(--text)] leading-[26px] break-ll'>
                    {index + 1}. {item.donator}
                  </p>
                  <p className='font-epilogue font-normal text-[var(--subtext)] leading-[26px] break-ll'>
                    {item.donation}
                  </p>
                </div>  
              )) : (
                <p className='font-epilogue font-normal text-[16px] text-[var(--subtext)] leading-[26px] text-justify'>
                  No donators yet. Be the first one
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fund Section */}
        <div className='flex-1'>
          <h4 className="font-epilogue font-semibold text-[18px] text-[var(--text)] uppercase">
            Fund
          </h4>
          <div className='mt-[20px] flex flex-col p-4 bg-[var(--card)] rounded-[10px] border border-[var(--border)]'>
            <p className='font-epilogue font-medium text-[20px] leading-[30px] text-center text-[var(--subtext)]'>
              Fund the campaign
            </p>
            <div className='mt-[30px]'>
              <input
                type='number'
                placeholder='ETH 0.1'
                step='0.1'
                className='w-full py-[10px] sm:px-[20px] px-[15px] 
                outline-none border-[1px] border-[var(--border)]
                bg-[var(--background)] font-epilogue text-[var(--text)] 
                text-[18px] leading-[30px] placeholder:text-[var(--subtext)] 
                rounded-[10px] transition-colors duration-200'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className='my-[20px] p-4 bg-[var(--secondary)] rounded-[10px]'>
                <h4 className='font-epilogue font-semibold text-[14px] leading-[22px] text-[var(--text)]'>
                  Back it because you believe in it.
                </h4>
                <p className='mt-[20px] font-epilogue font-normal leading-[22px] text-[var(--subtext)]'>
                  Support the project for no reward, just because it speaks to you.
                </p>
              </div>

              <CustomButton   
                btnType="button"
                title="Fund Campaign"
                styles="w-full bg-[var(--accent-secondary)]"
                handleClick={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails;