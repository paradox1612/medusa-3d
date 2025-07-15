'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Truck, Clock, Package, Globe, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const ShippingPage = () => {
  const { countryCode } = useParams();

  const shippingInfo = [
    {
      icon: <Truck className="w-8 h-8 text-blue-500" />,
      title: 'Domestic Shipping',
      description: 'We ship from Dallas, TX to all 50 states. Most packages are delivered within 7-10 business days after processing.'
    },
    {
      icon: <Globe className="w-8 h-8 text-green-500" />,
      title: 'International Shipping',
      description: 'We ship worldwide! International orders typically take 10-12 business days for delivery after processing.'
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: 'Processing Time',
      description: 'Each order takes 1-2 days to process and 3 days to print before shipping. We work hard to get your order to you as quickly as possible.'
    },
    {
      icon: <Package className="w-8 h-8 text-orange-500" />,
      title: 'Shipping Rates',
      description: 'Free shipping on all orders $50+. For orders under $50, a flat rate of $5.99 applies.'
    }
  ];

  const processSteps = [
    {
      step: '1',
      title: 'Upload Your Photo',
      description: 'Share your special moment with us through our easy upload system.'
    },
    {
      step: '2',
      title: 'We Create Your 3D Model',
      description: 'Our team transforms your photo into a detailed 3D model and shares a preview with you.'
    },
    {
      step: '3',
      title: 'Review & Approve',
      description: 'Once you approve the design, we move forward with the printing process.'
    },
    {
      step: '4',
      title: 'Printing & Shipping',
      description: 'We print your custom miniature (1-2 days), package it with care, and ship it to your doorstep.'
    }
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Shipping Information
          </h1>
          <p className="mt-3 max-w-3xl mx-auto text-xl text-gray-500">
            Fast, reliable shipping to bring your custom 3D miniatures to your doorstep
          </p>
        </div>

        {/* Shipping Information Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {shippingInfo.map((item, index) => (
            <div key={index} className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-white shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-5 text-base text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Our Process */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            How It Works
          </h2>
          <div className="mt-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white -left-4 -top-4">
                    {step.step}
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg h-full">
                    <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-20 bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Important Information</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                <strong>Customs & Duties:</strong> International customers are responsible for any customs fees, import duties, or taxes that may be applied by their country's customs office.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                <strong>Order Tracking:</strong> You'll receive a tracking number via email once your order ships so you can follow its journey to you.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                <strong>Customer Support:</strong> Have questions about shipping? Our support team is here to help at <a href="mailto:support@your3dminiatures.com" className="text-indigo-600 hover:text-indigo-500">support@your3dminiatures.com</a>.
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create Your Custom Miniature?</h2>
          <p className="text-lg text-gray-600 mb-8">Upload your photo today and we'll take care of the rest!</p>
          <Link
            href="/store"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
