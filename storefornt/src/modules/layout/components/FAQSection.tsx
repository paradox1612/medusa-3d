'use client';

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqData: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqData }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <Accordion.Root type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <Accordion.Item 
              key={index} 
              value={`item-${index}`} 
              className="border-b border-gray-200 last:border-b-0"
            >
              <Accordion.Header>
                <Accordion.Trigger className="flex justify-between items-center w-full py-4 text-left hover:text-purple-600 transition-colors group">
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <ChevronDownIcon 
                    className="h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" 
                    aria-hidden 
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="pt-2 pb-4 text-gray-600">
                  {item.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

export default FAQSection;