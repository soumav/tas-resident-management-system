
import React from 'react';
import { Heart, Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 px-6 border-t border-gray-300 w-full text-center text-sm text-gray-600 bg-gray-50">
      <div className="container mx-auto flex items-center justify-center gap-1">
        <span>Made with</span>
        <Heart className="h-4 w-4 text-sanctuary-green fill-sanctuary-green" /> 
        <span>by Soumav for The Alice Sanctuary</span>
        <span className="mx-1">•</span>
        <Copyright className="h-4 w-4" /> 
        <span>{currentYear}</span>
      </div>
    </footer>
  );
};

export default Footer;
