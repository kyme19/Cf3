import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

const CampaignInsights = ({ campaigns }) => {
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const InsightSection = ({ title, content, icon }) => (
    <div className={`rounded-[15px] p-6 mb-4 border transition-all duration-300 ${isDarkMode ? 'bg-[#2c2c34] border-[#3a3a43]' : 'bg-white border-gray-300'}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className={`font-epilogue font-semibold text-[18px] ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</h3>
      </div>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className={`mb-2 ${isDarkMode ? 'text-[#808191]' : 'text-gray-700'}`}>{children}</p>,
            ul: ({ children }) => <ul className={`list-disc list-inside space-y-1 ml-4 ${isDarkMode ? 'text-[#808191]' : 'text-gray-700'}`}>{children}</ul>,
            li: ({ children }) => <li className={`${isDarkMode ? 'text-[#808191]' : 'text-gray-700'}`}>{children}</li>,
            strong: ({ children }) => <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyCC6wB3yL57A1lIoyr4O4ux5TrjBAdO2u8'); // Replace with your actual API key
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash'});

      const campaignData = JSON.stringify(campaigns.map(c => ({
        title: c.title,
        target: c.target,
        amountCollected: c.amountCollected,
        deadline: c.deadline,
        donators: Array.isArray(c.donators) ? c.donators.length : 0,
        averageDonation: c.amountCollected / (Array.isArray(c.donators) && c.donators.length > 0 ? c.donators.length : 1),
      })));

      const prompt = `Analyze this campaign data and provide insights in the following format:
        # Funding Pace Analysis 📈
        [Predict the likelihood of reaching the target based on current trends.]

        # Donor Demographics 👥
        [Provide insights into donor patterns, such as average donation size and engagement times.]

        # Comparative Campaign Analysis 📊
        [Compare the current campaign's performance with similar campaigns.]

        # Conversion Rate 📉
        [Display the percentage of page visitors who donate.]
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setInsights(response.text());
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (campaigns.length > 0) {
      generateInsights();
    }
  }, [campaigns]);

  const sections = [
    {
      title: 'Funding Pace Analysis',
      content: insights.split('# Donor Demographics')[0],
      icon: '📈'
    },
    {
      title: 'Donor Demographics',
      content: insights.split('# Donor Demographics')[1]?.split('# Comparative Campaign Analysis')[0],
      icon: '👥'
    },
    {
      title: 'Comparative Campaign Analysis',
      content: insights.split('# Comparative Campaign Analysis')[1]?.split('# Conversion Rate')[0],
      icon: '📊'
    },
    {
      title: 'Conversion Rate',
      content: insights.split('# Conversion Rate')[1],
      icon: '📉'
    }
  ];

  return (
    <div className={`rounded-[15px] p-6 shadow-lg ${isDarkMode ? 'bg-[#1c1c24]' : 'bg-white'}`}>
      <h2 className={`font-epilogue font-semibold text-[20px] ${isDarkMode ? 'text-white' : 'text-black'} mb-6`}>
        Detailed Campaign Analysis 🔍
      </h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map((section, index) => (
            section.content && (
              <InsightSection
                key={index}
                title={section.title}
                content={section.content}
                icon={section.icon}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignInsights;

