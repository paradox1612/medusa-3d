'use client';

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqData: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqData }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-purple-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            <span className="text-gray-700 font-medium">Minimica</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Frequently asked
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              questions
            </span>
          </h1>
          
          <p className="text-gray-600 text-lg max-w-2xl">
            Get answers to common questions about our personalized 3D miniatures service.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-8">
            <Accordion.Root type="single" collapsible className="w-full space-y-4">
              {faqData.map((item, index) => (
                <Accordion.Item 
                  key={index} 
                  value={`item-${index}`} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex justify-between items-center w-full p-6 text-left hover:bg-gray-50/50 transition-colors group [&[data-state=open]>svg]:rotate-180">
                      <span className="font-semibold text-gray-900 text-lg pr-4">{item.question}</span>
                      <div className="flex-shrink-0">
                        <ChevronDown 
                          className="h-5 w-5 text-purple-500 transition-transform duration-300" 
                        />
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.3s_ease-out] data-[state=open]:animate-[accordion-down_0.3s_ease-out]">
                    <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;