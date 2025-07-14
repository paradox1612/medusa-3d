'use client';

import React from 'react';
import { Upload, Eye, Printer, Palette, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const HowItWorksPage = () => {
  const { countryCode } = useParams();
  const steps = [
    {
      number: 1,
      title: "Upload your photos",
      description: "Upload 1-4 high-quality photos from different angles. Our AI works best with clear, well-lit images.",
      icon: Upload,
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50"
    },
    {
      number: 2,
      title: "AI creates your 3D model",
      description: "Our proprietary 3D AI model processes your photos and creates a detailed 3D miniature in just a few minutes.",
      icon: Eye,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      number: 3,
      title: "Preview & approve",
      description: "View your 3D model from all angles before ordering. Make adjustments or approve for printing.",
      icon: CheckCircle,
      color: "from-pink-500 to-red-500",
      bgColor: "bg-pink-50"
    },
    {
      number: 4,
      title: "3D printed with precision",
      description: "We use state-of-the-art resin printers to create your miniature with incredible detail and quality.",
      icon: Printer,
      color: "from-green-500 to-blue-500",
      bgColor: "bg-green-50"
    },
    {
      number: 5,
      title: "Paint together at home",
      description: "Receive your unpainted miniature with premium colors, primer, and brushes. Create your masterpiece together!",
      icon: Palette,
      color: "from-yellow-500 to-pink-500",
      bgColor: "bg-yellow-50"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-purple-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-8">
          <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
          <span className="text-gray-700 font-medium">Minimica</span>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Date night,
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              upgraded
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-8">
            Paint your personalized 3D miniatures together. Upload 1-4 photos, we craft a paintable figure for your perfect date night.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mb-12">How it works:</h2>
        </div>

        {/* Steps Section */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.number}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-10 top-20 w-0.5 h-16 bg-gradient-to-b from-gray-300 to-transparent z-0"></div>
                )}
                
                <div className="flex items-start gap-8 relative z-10">
                  {/* Step Number Circle */}
                  <div className={`flex-shrink-0 w-20 h-20 rounded-full ${step.bgColor} flex items-center justify-center relative`}>
                    <span className="text-2xl font-bold text-gray-700">{step.number}</span>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* What's Included Section */}
        <div className="mt-20">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Complete Kit Included
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-gray-900">What you'll receive:</h4>
                  <ul className="space-y-3">
                    {[
                      "Your personalized 3D printed miniature",
                      "Premium acrylic paint set (12 colors)",
                      "Professional primer for perfect base coating",
                      "High-quality brushes (3 different sizes)",
                      "Step-by-step painting guide",
                      "Protective finish for long-lasting results"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Perfect for:</h4>
                  <ul className="space-y-2">
                    {[
                      "Date nights at home",
                      "Anniversary celebrations",
                      "Creative couple activities",
                      "Unique gift experiences",
                      "Memory preservation"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-12 border border-white/50">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to create your miniature?</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Start your personalized 3D miniature experience today. Upload your photos and see the magic happen!
            </p>
            <Link 
              href={`/${countryCode}/store`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              Start Creating Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
