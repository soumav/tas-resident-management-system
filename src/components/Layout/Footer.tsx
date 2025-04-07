
import React from 'react';
import { Heart, Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-2 px-6 border-t border-gray-200 mt-auto text-center text-xs text-gray-500">
      <div className="flex items-center justify-center gap-1">
        <span>Made with</span>
        <Heart className="h-3 w-3 text-sanctuary-green fill-sanctuary-green" /> 
        <span>by Soumav for The Alice Sanctuary</span>
        <span className="mx-1">•</span>
        <Copyright className="h-3 w-3" /> 
        <span>{currentYear}</span>
      </div>
    </footer>
  );
};

export default Footer;
