import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar, Navbar, Footer } from './components';
import { CampaignDetails, CreateCampaign, Home, Profile, WithdrawRequest, CreateWithdrawRequest } from './pages';
import { ThemeProvider } from './context/ThemeContext';
import { StateContextProvider } from './context';

const App = () => {
    return (
        <ThemeProvider>
            <StateContextProvider>
                <div className="relative sm:-8 p-4 bg-[var(--background)] min-h-screen flex flex-col">
                    <div className="flex flex-1">
                        {/* Sidebar - hidden on mobile */}
                        <div className="sm:flex hidden mr-10 relative">
                            <Sidebar />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5 flex flex-col">
                            <Navbar />
                            
                            {/* Main Content Area */}
                            <main className="flex-1">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/create-campaign" element={<CreateCampaign />} />
                                    <Route path="/campaign-details/:id" element={<CampaignDetails />} />
                                    <Route path="/campaign/:id/withdraw" element={<WithdrawRequest />} />
                                    <Route path="/campaign/:id/withdraw/create" element={<CreateWithdrawRequest />} />
                                </Routes>
                            </main>
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer />
                </div>
            </StateContextProvider>
        </ThemeProvider>
    );
};

export default App;