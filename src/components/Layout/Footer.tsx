
import React from 'react';
import { Heart, Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-1 px-2 sm:py-2 sm:px-4 border-t border-gray-200 mt-auto text-center text-xs text-gray-500 bg-white w-full">
      <div className="flex items-center justify-center gap-1">
        <span className="hidden xs:inline">Made with</span>
        <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-sanctuary-green fill-sanctuary-green" /> 
        <span>by Soumav for The Alice Sanctuary</span>
        <span className="mx-1 hidden sm:inline">•</span>
        <Copyright className="h-2.5 w-2.5 sm:h-3 sm:w-3 hidden sm:block" /> 
        <span className="hidden sm:inline">{currentYear}</span>
      </div>
    </footer>
  );
};

export default Footer;
