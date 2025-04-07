
import React from 'react';
import { Heart, Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 px-6 border-t border-gray-200 mt-auto text-center text-sm text-gray-500">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-1">
          Made with 
          <Heart className="h-4 w-4 text-sanctuary-green fill-sanctuary-green" /> 
          by Soumav for The Alice Sanctuary
        </div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Copyright className="h-3 w-3" /> 
          <span>{currentYear} The Alice Sanctuary. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
