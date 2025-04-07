
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Globe, Database, Shield } from 'lucide-react';

export default function About() {
  return <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold text-sanctuary-dark-green mb-8">About The Alice Sanctuary</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-sanctuary-dark-green flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            About Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Established in 2014 near Calgary, Alberta, Canada, The Alice Sanctuary is a registered charity, farm animal sanctuary and home to over 200 residents.
          </p>
          
          <div className="bg-sanctuary-dark-green/10 p-4 rounded-md inline-block">
            <p className="font-medium">Charity registration number: 801521436 RR0001</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-sanctuary-dark-green flex items-center gap-2">
            <Globe className="h-6 w-6 text-sanctuary-dark-green" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            The Alice Sanctuary's mission is to provide care and healing for rescued, surrendered, and abandoned farm animals.
          </p>
          
          <p className="text-lg">
            Drawing from the resiliency and life-affirming presence of the animals who live here, our goal is to empower, encourage, and inspire visitors to find the tools they need to go out and make a positive change in the world around them.
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-sanctuary-dark-green flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            About This Application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            The Alice Sanctuary Resident Management System is a comprehensive digital solution designed specifically for farm animal sanctuaries. This application helps sanctuary staff and volunteers efficiently manage animal residents, track their care, and organize operational activities.
          </p>
          
          <h3 className="text-xl font-medium text-sanctuary-dark-green mt-4">Key Features:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Resident profiles with detailed information including species, health records, diet, and special needs</li>
            <li>Group management to organize animals by species, location, or specific care requirements</li>
            <li>Staff and volunteer coordination tools</li>
            <li>Customizable resident types to accommodate various species</li>
            <li>Dashboard with key statistics and quick access to important information</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-sanctuary-dark-green flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            Data Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            We take the security and privacy of your sanctuary data seriously. This application implements:
          </p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure user authentication</li>
            <li>Role-based access control</li>
            <li>Regular data backups</li>
            <li>Data encryption for sensitive information</li>
          </ul>
          
          <p className="text-lg mt-4">
            This system was developed with input from animal sanctuary staff to ensure it meets the practical day-to-day needs of managing farm animal residents.
          </p>
        </CardContent>
      </Card>
    </div>;
}
