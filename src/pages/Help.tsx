
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mail, Phone } from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      question: "How do I add a new resident?",
      answer: "Navigate to 'Residents > Add Resident' from the sidebar menu. Fill out the required information in the form including name, species, age, and other details. Upload a photo if available. Click 'Save Resident' when complete."
    },
    {
      question: "How do I organize residents into groups?",
      answer: "Go to the 'Groups' page from the sidebar. You can create new groups, assign residents to existing groups, or move residents between groups. Groups help organize animals by species, location, or other criteria."
    },
    {
      question: "How do I edit resident information?",
      answer: "On the 'All Residents' page, find the resident you want to edit and click the edit icon (pencil). Make your changes in the form and click 'Save Changes' to update the resident's information."
    },
    {
      question: "Can I delete a resident from the system?",
      answer: "Yes. Find the resident on the 'All Residents' page or within a group and click the delete icon (trash). You will be asked to confirm the deletion before it's permanent."
    },
    {
      question: "How do I add staff or volunteers to the system?",
      answer: "Go to the 'Staff & Volunteers' page from the sidebar. Click 'Add New Staff' or 'Add New Volunteer' and fill out the required information. This allows you to track who has access to the resident management system."
    },
    {
      question: "How do I create a new resident type?",
      answer: "Navigate to 'Resident Types' from the sidebar menu. Click 'Add New Type', provide the species name and details. This helps categorize residents and apply species-specific care information."
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold text-sanctuary-dark-green mb-8 flex items-center gap-2">
        <HelpCircle className="h-7 w-7" />
        Help & Support
      </h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="py-2 text-gray-700">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you couldn't find an answer to your question, please reach out to our support team:
          </p>
          
          <div className="flex items-center gap-2 text-sanctuary-dark-green">
            <Mail className="h-5 w-5" />
            <span>support@alicesanctuary.ca</span>
          </div>
          
          <div className="flex items-center gap-2 text-sanctuary-dark-green">
            <Phone className="h-5 w-5" />
            <span>(403) 123-4567</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
