import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo, sun } from "../assets";
import { navlinks } from "../constants";
import { useTheme } from '../context/ThemeContext';

// Create new moon icon component
const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0557 3.59438C12.2752 3.28896 12.2913 2.89594 12.0972 2.57346C11.9031 2.25098 11.5335 2.0611 11.1478 2.08506C7.09241 2.3598 3.74347 5.70874 3.46873 9.76416C3.09122 15.0738 7.27098 19.5 12.5 19.5C16.5125 19.5 19.8764 16.8578 20.4903 13.0946C20.5668 12.6776 20.3473 12.2629 19.9583 12.0943C19.5693 11.9257 19.1143 12.041 18.8555 12.3697C17.5029 14.0559 15.1865 15.0001 12.7501 15.0001C8.74008 15.0001 5.49529 11.7553 5.49529 7.74527C5.49529 6.49792 5.81471 5.31997 6.38789 4.29056C6.83438 3.4904 7.43655 2.78644 8.15272 2.21327C8.95758 1.56353 9.87371 1.07896 10.8611 0.798875C11.2459 0.68香港 11.8362 3.89981 12.0557 3.59438Z" fill="currentColor"/>
  </svg>
);

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] 
    ${isActive && isActive === name && "bg-[var(--secondary)]"}
     flex justify-center items-center ${
       !disabled && "cursor-pointer"
     } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
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
              handleClick={() => {
                if (!link.disabled) {
                  setisActive(link.name);
                  navigate(link.link);
                }
              }}
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
            <div className="w-1/2 h-1/2 text-[var(--subtext)]">
              <MoonIcon />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;