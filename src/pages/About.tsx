
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto py-6 space-y-8">
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
        
        <CardFooter className="bg-gray-50 border-t">
          <p className="text-sm text-gray-500">Together, we're making a difference in the lives of farm animals.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
