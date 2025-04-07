
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t border-gray-200 mt-auto text-center text-sm text-gray-500">
      <div className="flex items-center justify-center gap-1">
        Made with 
        <Heart className="h-4 w-4 text-sanctuary-green fill-sanctuary-green" /> 
        by Soumav for The Alice Sanctuary
      </div>
    </footer>
  );
};

export default Footer;
