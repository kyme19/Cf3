import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage } from "../utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { money } from "../assets";
import { useTheme } from '../context/ThemeContext';

const genAI = new GoogleGenerativeAI("AIzaSyApXdUX1M5e8Uz0d4VbKUgib7Ql00Chptw");

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign, address } = useStateContext();
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { isDarkMode } = useTheme();

  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Story is required";
    if (!form.target || isNaN(form.target) || form.target <= 0) {
      newErrors.target = "Please enter a valid target amount";
    }
    if (!form.deadline) newErrors.deadline = "End date is required";
    if (!form.image) newErrors.image = "Campaign image is required";

    // Validate deadline is in the future
    if (form.deadline && new Date(form.deadline) <= new Date()) {
      newErrors.deadline = "End date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: null });
    }
  }

  const generateStory = async () => {
    if (!form.title || !aiPrompt) {
      alert("Please provide both a campaign title and some context for the AI");
      return;
    }

    setIsGenerating(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Write a compelling crowdfunding campaign story (250-300 words) for a campaign titled "${form.title}". 
        Additional context: ${aiPrompt}
        Make it emotional, authentic, and include:
        - The problem or need
        - Personal connection to the cause
        - Specific goals and how funds will be used
        - Impact on beneficiaries
        - Call to action
        Keep the tone professional but engaging.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setForm(prev => ({ ...prev, description: text }));
      setShowAIHelper(false); // Hide the AI helper after successful generation
      setAiPrompt(""); // Reset the prompt
    } catch (error) {
      console.error("AI Story generation failed:", error);
      alert("Failed to generate story. Please try again or write your own.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    try {
      setIsLoading(true);
      await checkIfImage(form.image, async (exists) => {
        if (exists) {
          try {
            const parsedAmount = ethers.utils.parseUnits(form.target, 18);
            await createCampaign({
              ...form,
              target: parsedAmount.toString(),
            });
            alert("Campaign created successfully!");
            navigate('/');
          } catch (error) {
            console.error("Campaign creation failed:", error);
            alert(`Campaign creation failed: ${error.message}`);
          }
        } else {
          alert('Please provide a valid image URL');
          setForm(prev => ({ ...prev, image: '' }));
        }
      });
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred while creating the campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4 transition-colors duration-200">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[var(--secondary)] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-[var(--text)]">
          Start a Campaign 🚀
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Your Name *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)}
            error={errors.name}
          />
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
            error={errors.title}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <h4 className="font-epilogue font-medium text-[14px] leading-[22px] text-[var(--text)]">
              Story *
            </h4>
            <button
              type="button"
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="text-2xl hover:opacity-80 transition-opacity"
              title="Get AI assistance"
            >
              ✨
            </button>
          </div>

          {showAIHelper && (
            <div className="mt-4 p-4 bg-[var(--secondary)] rounded-[10px] border border-[var(--border)]">
              <textarea
                placeholder="Provide context for your campaign (e.g., purpose, background, goals) to help AI generate a compelling story..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full min-h-[100px] p-4 rounded-[10px] bg-[var(--background)] 
                  text-[var(--text)] placeholder:text-[var(--subtext)] border border-[var(--border)]
                  outline-none resize-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="button"
                onClick={generateStory}
                disabled={isGenerating}
                className={`mt-4 px-4 py-2 rounded-[10px] bg-[var(--accent)] text-white
                  hover:opacity-90 transition-opacity ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? 'Generating...' : 'Generate Story'}
              </button>
            </div>
          )}

          <FormField
            isTextArea
            placeholder="Write your story"
            value={form.description}
            handleChange={(e) => handleFormFieldChange('description', e)}
            error={errors.description}
          />
        </div>

        <div className="w-full flex justify-start items-center p-4 bg-[var(--gradient-1)] h-[120px] rounded-[10px]">
          <img src={money} alt="money" className="w-[40px] h-[40px] object-contain"/>
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">
            You will get 100% of the raised amount
          </h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Goal (ETH) *"
            placeholder="ETH 0.50"
            inputType="number"
            value={form.target}
            handleChange={(e) => handleFormFieldChange('target', e)}
            error={errors.target}
          />
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
            error={errors.deadline}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <FormField
          labelName="Campaign Image *"
          placeholder="Place image URL of your campaign"
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange('image', e)}
          error={errors.image}
        />

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton 
            btnType="submit"
            title={isLoading ? "Creating..." : "Submit new campaign"}
            styles={`bg-[var(--accent)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;