import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo, sun } from "../assets";
import { navlinks } from "../constants";
import { useTheme } from '../context/ThemeContext';
import { BsMoonFill } from 'react-icons/bs';
import { useStateContext } from '../context';
import { useDisconnect } from "@thirdweb-dev/react";

// Create new moon icon component
const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick, IconComponent }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] 
    ${isActive && isActive === name && "bg-[var(--secondary)]"}
     flex justify-center items-center ${
       !disabled && "cursor-pointer"
     } ${styles}`}
    onClick={handleClick}
  >
    {IconComponent ? (
      <IconComponent 
        className={`w-1/2 h-1/2 text-[var(--text)] ${isActive !== name && "opacity-50"}`}
      />
    ) : !isActive ? (
      <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"}`}
      />
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setisActive] = useState("dashboard");
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
      setisActive(link.name);
      navigate(link.link);
    }
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link to="/">
        <Icon styles="w-[52px] h-[52px] bg-[var(--secondary)]" imgUrl={logo} />
      </Link>

      <div className="flex-1 flex flex-col justify-between items-center bg-[var(--primary)] rounded-[20px] w-[76px] mt-12">
        <div className="flex flex-col justify-center items-center gap-3">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => handleNavigation(link)}
            />
          ))}
        </div>

        <button 
          onClick={toggleTheme}
          className="w-[48px] h-[48px] rounded-[10px] flex justify-center items-center cursor-pointer bg-[var(--secondary)] mb-4"
        >
          {isDarkMode ? (
            <img src={sun} alt="light mode" className="w-1/2 h-1/2" />
          ) : (
            <BsMoonFill className="w-1/2 h-1/2 text-[var(--text)]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;