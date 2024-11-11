import React from 'react';
import { Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[var(--background)] py-8 px-4 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left side - Tagline */}
                    <p className="font-epilogue text-[var(--subtext)] text-sm">
                        Made with blood, sweat and tears 💪
                    </p>

                    {/* Center - Navigation */}
                    <div className="flex gap-6">
                        <a href="#top" className="font-epilogue text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                            Home
                        </a>
                        <a 
                            href="https://github.com/kyme19" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-epilogue text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                        >
                            GitHub
                        </a>
                        <span className="font-epilogue text-[var(--subtext)] cursor-not-allowed">
                            Contact
                        </span>
                    </div>

                    {/* Right side - Social Icons */}
                    <div className="flex gap-4">
                        <Github className="w-5 h-5 text-[var(--subtext)] hover:text-[var(--text)] transition-colors cursor-pointer" />
                        <Twitter className="w-5 h-5 text-[var(--subtext)] hover:text-[var(--text)] transition-colors cursor-pointer" />
                        <Instagram className="w-5 h-5 text-[var(--subtext)] hover:text-[var(--text)] transition-colors cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;