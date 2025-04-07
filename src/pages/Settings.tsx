
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MapPin, Phone, Globe, Clock, AlertTriangle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold text-sanctuary-dark-green mb-8">Settings</h1>
      
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="contact">Contact Information</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="hours">Hours & Visits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-sanctuary-dark-green" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="font-medium">General Inquiries:</p>
                  <p>info@alicesanctuary.ca</p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Volunteer Opportunities:</p>
                  <p>volunteer@alicesanctuary.ca</p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Donation Inquiries:</p>
                  <p>donate@alicesanctuary.ca</p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Phone:</p>
                  <p>(403) 123-4567</p>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="font-medium">Connect with us:</p>
                <div className="flex gap-4 mt-2">
                  <a href="https://facebook.com" className="text-blue-600 hover:text-blue-800">Facebook</a>
                  <a href="https://instagram.com" className="text-pink-600 hover:text-pink-800">Instagram</a>
                  <a href="https://twitter.com" className="text-blue-400 hover:text-blue-600">Twitter</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sanctuary-dark-green" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">The Alice Sanctuary</p>
              <p>123 Sanctuary Road</p>
              <p>Whispering Pines, Alberta T1X 0B3</p>
              <p>Canada</p>
              
              <div className="bg-gray-100 p-4 rounded mt-4">
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Visiting Information
                </p>
                <p className="mt-2">Please note that The Alice Sanctuary is a private property and visits are by appointment only.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sanctuary-dark-green" />
                Hours & Visitation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Sanctuary Hours:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                  <li>Saturday: 10:00 AM - 4:00 PM</li>
                  <li>Sunday: Closed (except for special events)</li>
                </ul>
              </div>
              
              <div className="space-y-2 pt-4">
                <p className="font-medium">Tours:</p>
                <p>Tours are available by appointment only. Please email tours@alicesanctuary.ca to schedule a visit.</p>
              </div>
              
              <div className="space-y-2 pt-4">
                <p className="font-medium">Volunteer Days:</p>
                <p>Regular volunteer days are held every Saturday from 10:00 AM - 2:00 PM. New volunteers must attend an orientation session.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="shadow-md mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sanctuary-dark-green" />
            Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a 
            href="https://www.thealicesanctuary.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            www.thealicesanctuary.org
          </a>
          <p className="mt-2 text-gray-600">Visit our official website to learn more about our mission, residents, and how you can help.</p>
        </CardContent>
      </Card>
    </div>
  );
}
