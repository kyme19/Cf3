import React from "react";

const FormField = ({
  labelName,
  placeholder,
  inputType,
  isTextArea,
  value,
  handleChange,
  options = [],
}) => {
  return (
    <label className="flex-1 w-full flex flex-col">
      {labelName && (
        <span className="font-epilogue font-medium text-[14px] leading-[22px] text-[var(--subtext)] mb-[10px]">
          {labelName}
        </span>
      )}
      {isTextArea ? (
        <textarea
          required
          value={value}
          onChange={handleChange}
          rows={10}
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[var(--border)] 
          bg-[var(--background)] font-epilogue text-[var(--text)] text-[14px] 
          placeholder:text-[var(--subtext)] rounded-[10px] sm:min-w-[300px]
          focus:border-[var(--accent)] transition-colors duration-300"
        />
      ) : inputType === "select" ? (
        <select
          required
          value={value}
          onChange={handleChange}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px]
           border-[var(--border)] bg-[var(--background)] font-epilogue text-[var(--text)] text-[14px] 
           rounded-[10px] sm:min-w-[300px] cursor-pointer
           focus:border-[var(--accent)] transition-colors duration-300"
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[var(--background)] text-[var(--text)] py-2"
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          required
          value={value}
          onChange={handleChange}
          type={inputType}
          step="0.1"
          placeholder={placeholder}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[var(--border)]
          bg-[var(--background)] font-epilogue text-[var(--text)] text-[14px] 
          placeholder:text-[var(--subtext)] rounded-[10px] sm:min-w-[300px]
          focus:border-[var(--accent)] transition-colors duration-300"
        />
      )}
    </label>
  );
};

export default FormField;
