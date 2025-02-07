import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage } from "../utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { money } from "../assets";
import { useTheme } from '../context/ThemeContext';

const genAI = new GoogleGenerativeAI("AIzaSyAedprea8VTewgVKuFUXg4oE5AvKIbpXgw");

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
            // Convert ETH to Wei for smart contract
            const parsedAmount = ethers.utils.parseEther(form.target);
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
    <div className="bg-[var(--background)] flex-1 min-h-screen">
      <div className="flex justify-center items-start p-4 sm:p-8">
        <div className="flex justify-center items-center flex-col bg-[var(--card)] rounded-[10px] sm:w-[700px] w-full p-4 sm:p-10">
          {/* Wallet Status */}
          <div className="w-full flex justify-end mb-4">
            {address ? (
              <div className="flex items-center gap-2 bg-[var(--secondary)] px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                <p className="font-epilogue text-[14px] text-[var(--text)]">Wallet Connected</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[var(--secondary)] px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[var(--error)]"></span>
                <p className="font-epilogue text-[14px] text-[var(--text)]">⚠️ Please connect wallet</p>
              </div>
            )}
          </div>

          <h1 className="font-epilogue font-bold text-[28px] text-[var(--text)] text-center mb-8">
            Start a Campaign
          </h1>

          {!address ? (
            <div className="text-center py-8">
              <p className="font-epilogue text-[16px] text-[var(--text)]">
                Please connect your wallet to create a campaign
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
              {/* Money Info Card */}
              <div className="bg-[var(--success)]/5 border border-[var(--success)]/20 p-4 rounded-[10px] flex items-center gap-4 mb-6">
                <div className="bg-[var(--success)]/10 p-2 rounded-full">
                  <img src={money} alt="money" className="w-[32px] h-[32px] object-contain"/>
                </div>
                <div>
                  <h4 className="font-epilogue font-semibold text-[16px] text-[var(--text)]">
                    You will get 100% of the raised amount
                  </h4>
                  <p className="font-epilogue text-[12px] text-[var(--subtext)] mt-1">
                    Campaigns raise more when they have a clear goal and plan
                  </p>
                </div>
              </div>

              {/* Campaign Form Fields */}
              <div className="flex flex-col gap-6">
                <FormField 
                  labelName="Your Name *"
                  placeholder="John Doe"
                  inputType="text"
                  value={form.name}
                  handleChange={(e) => handleFormFieldChange('name', e)}
                />
                {errors.name && <p className="text-[var(--error)] text-[14px] mt-1">{errors.name}</p>}

                <FormField 
                  labelName="Campaign Title *"
                  placeholder="Write a catchy title"
                  inputType="text"
                  value={form.title}
                  handleChange={(e) => handleFormFieldChange('title', e)}
                />
                {errors.title && <p className="text-[var(--error)] text-[14px] mt-1">{errors.title}</p>}

                <div className="relative">
                  <FormField 
                    labelName="Story *"
                    placeholder="Write your story"
                    isTextArea
                    value={form.description}
                    handleChange={(e) => handleFormFieldChange('description', e)}
                  />
                  {errors.description && <p className="text-[var(--error)] text-[14px] mt-1">{errors.description}</p>}

                  {/* AI Helper Button */}
                  <button
                    type="button"
                    onClick={() => setShowAIHelper(true)}
                    className="absolute top-0 right-0 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    AI Help ✨
                  </button>
                </div>

                <div className="flex flex-wrap gap-8">
                  <div className="w-full sm:w-[calc(50%-16px)]">
                    <FormField 
                      labelName="Goal *"
                      placeholder="ETH 0.50"
                      inputType="text"
                      value={form.target}
                      handleChange={(e) => handleFormFieldChange('target', e)}
                    />
                    {errors.target && <p className="text-[var(--error)] text-[14px] mt-1">{errors.target}</p>}
                  </div>

                  <div className="w-full sm:w-[calc(50%-16px)]">
                    <FormField 
                      labelName="End Date *"
                      placeholder="End Date"
                      inputType="date"
                      value={form.deadline}
                      handleChange={(e) => handleFormFieldChange('deadline', e)}
                    />
                    {errors.deadline && <p className="text-[var(--error)] text-[14px] mt-1">{errors.deadline}</p>}
                  </div>
                </div>

                <FormField 
                  labelName="Campaign image *"
                  placeholder="Place image URL of your campaign"
                  inputType="url"
                  value={form.image}
                  handleChange={(e) => handleFormFieldChange('image', e)}
                />
                {errors.image && <p className="text-[var(--error)] text-[14px] mt-1">{errors.image}</p>}

                {form.image && (
                  <div className="mt-2">
                    <img 
                      src={form.image} 
                      alt="campaign" 
                      className="w-full h-[200px] object-cover rounded-[10px]"
                      onError={(e) => {
                        e.target.onerror = null;
                        setErrors(prev => ({...prev, image: "Invalid image URL"}));
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-center items-center mt-4">
                <CustomButton 
                  btnType="submit"
                  title={isLoading ? "Creating..." : "Submit Campaign 🚀"}
                  styles={`bg-[var(--accent)] hover:bg-[var(--accent)]/90 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                />
              </div>
            </form>
          )}

          {/* AI Helper Modal */}
          {showAIHelper && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-[var(--card)] p-6 rounded-lg w-full max-w-[500px] relative">
                {/* Close button */}
                <button
                  onClick={() => setShowAIHelper(false)}
                  className="absolute top-4 right-4 text-[var(--subtext)] hover:text-[var(--text)] transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-epilogue font-semibold text-[20px] text-[var(--text)] mb-4">
                  AI Story Helper ✨
                </h3>

                <p className="text-[var(--subtext)] mb-4 text-[14px]">
                  Let AI help you create a compelling campaign story. Describe your idea briefly, and we'll generate a detailed story for you.
                </p>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., I'm raising funds to build a community garden that will provide fresh produce to local food banks..."
                  className="w-full p-4 rounded-lg bg-[var(--background)] text-[var(--text)] border border-[var(--border)] mb-4 min-h-[120px] focus:border-[var(--accent)] outline-none transition-colors"
                  rows={4}
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAIHelper(false)}
                    className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--background)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateStory}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className={`px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2
                        ${(isGenerating || !aiPrompt.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⚡</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Generate Story
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;