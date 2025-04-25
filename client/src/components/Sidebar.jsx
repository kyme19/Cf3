import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo, sun } from "../assets";
import { navlinks } from "../constants";
import { useTheme } from '../context/ThemeContext';
import { BsMoonFill } from 'react-icons/bs';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useStateContext } from '../context';
import { useDisconnect } from "@thirdweb-dev/react";

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick, IconComponent, text, isExpanded, isDarkMode }) => (
  <div
    className={`${isExpanded ? 'w-full px-4' : 'w-[48px]'} h-[48px] rounded-[10px] 
    ${isActive && isActive === name && (isDarkMode ? "bg-[#2c2f32]" : "bg-[#eaeaea]")}
    flex items-center ${!disabled && "cursor-pointer"} ${styles}
    ${isExpanded ? 'justify-start' : 'justify-center'}`}
    onClick={handleClick}
  >
    <div className={`flex items-center ${isExpanded ? 'w-full' : ''}`}>
      <div className={`min-w-[36px] flex justify-center`}>
        {IconComponent ? (
          <IconComponent 
            className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-[#1c1c24]'} ${isActive !== name && "opacity-50"}`}
          />
        ) : !isActive ? (
          <img 
            src={imgUrl} 
            alt="fund_logo" 
            className={`w-1/2 h-1/2 ${!isDarkMode && "filter invert"}`} 
          />
        ) : (
          <img
            src={imgUrl}
            alt="fund_logo"
            className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"} ${!isDarkMode && "filter invert"}`}
          />
        )}
      </div>
      {isExpanded && (
        <span className={`ml-[16px] font-epilogue font-semibold text-[14px] ${isDarkMode ? 'text-white' : 'text-[#1c1c24]'} ${isActive !== name && "opacity-50"}`}>
          {text || name}
        </span>
      )}
    </div>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { address } = useStateContext();
  const disconnect = useDisconnect();

  const handleNavigation = (link) => {
    if (link.name === "logout") {
      disconnect();
      navigate("/");
      return;
    }
    
    if (!link.disabled) {
      setIsActive(link.name);
      navigate(link.link);
    }
  };

  return (
    <div className={`flex justify-between items-center flex-col sticky top-5 h-[93vh] transition-all duration-300 ${isExpanded ? 'w-[240px]' : 'w-[76px]'}`}>
      <Link to="/">
        <Icon 
          styles={`w-[52px] h-[52px] ${isDarkMode ? 'bg-[#2c2f32]' : 'bg-[#eaeaea]'}`} 
          imgUrl={logo} 
          isDarkMode={isDarkMode}
        />
      </Link>

      <div className={`flex-1 flex flex-col justify-between items-center ${isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'} rounded-[20px] ${isExpanded ? 'w-full' : 'w-[76px]'} mt-12 relative shadow-md`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute -right-3 top-6 w-6 h-6 ${isDarkMode ? 'bg-[#2c2f32]' : 'bg-[#eaeaea]'} rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
        >
          {isExpanded ? (
            <FiChevronLeft className={isDarkMode ? 'text-white' : 'text-[#1c1c24]'} />
          ) : (
            <FiChevronRight className={isDarkMode ? 'text-white' : 'text-[#1c1c24]'} />
          )}
        </button>

        <div className="flex flex-col justify-center items-center gap-3 w-full pt-8">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => handleNavigation(link)}
              isExpanded={isExpanded}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        <button 
          onClick={toggleTheme}
          className={`${isExpanded ? 'w-[calc(100%-32px)]' : 'w-[48px]'} h-[48px] rounded-[10px] flex items-center cursor-pointer ${isDarkMode ? 'bg-[#2c2f32]' : 'bg-[#eaeaea]'} mb-4 ${isExpanded ? 'px-4' : 'justify-center'} hover:opacity-90 transition-opacity`}
        >
          <div className={`flex items-center ${isExpanded ? 'w-full' : ''}`}>
            <div className="min-w-[36px] flex justify-center">
              {isDarkMode ? (
                <img src={sun} alt="light mode" className="w-6 h-6" />
              ) : (
                <BsMoonFill className="w-6 h-6 text-[#1c1c24]" />
              )}
            </div>
            {isExpanded && (
              <span className={`ml-[16px] font-epilogue font-semibold text-[14px] ${isDarkMode ? 'text-white' : 'text-[#1c1c24]'}`}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;