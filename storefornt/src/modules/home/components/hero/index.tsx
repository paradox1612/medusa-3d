"use client"
import React, { useState, useEffect } from 'react';
import { Star, Shield, Truck, ArrowRight, Play, Upload, Heart, CheckCircle } from 'lucide-react';

const Hero = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    "Upload your photos",
    "We craft your 3D miniature", 
    "Paint together at home"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white">
      {/* Trust Bar */}
      

      {/* Main Hero */}
      <div className="bg-gradient-to-br from-emerald-100 via-teal-50 via-yellow-50 to-orange-100 relative overflow-hidden min-h-screen">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className={`space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              
              {/* Badge */}
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200/50 shadow-sm">
                <Heart size={14} className="mr-2 text-pink-500" />
                Turn Memories Into Art
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block">Date night,</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                    upgraded
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Paint your personalized 3D miniatures together. Upload 1-4 photos, 
                  we craft a paintable figure for your perfect date night.
                </p>
              </div>

              {/* Process Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works:</h3>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                        index === currentStep 
                          ? 'bg-white/60 backdrop-blur-sm border border-purple-200/50 shadow-sm' 
                          : 'bg-white/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium transition-colors duration-300 ${
                        index === currentStep ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {step}
                      </span>
                      {index === currentStep && (
                        <CheckCircle size={16} className="text-emerald-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">$89</span>
                  <span className="text-lg text-gray-500 line-through">$120</span>
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Save $31
                  </span>
                </div>
                <p className="text-gray-600 mb-4">Complete kit for 2 miniatures + painting supplies</p>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Custom 3D miniatures from your photos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Professional acrylic paints & brushes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Step-by-step painting guide</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <Upload size={20} />
                  <span>Upload Photos - $89</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                
                <button className="border-2 border-gray-200 hover:border-gray-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play size={20} />
                  <span>Watch Process</span>
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-pink-200 to-purple-200"
                      ></div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="text-amber-400 fill-current" />
                      ))}
                      <span className="ml-1 font-semibold text-gray-900">4.9</span>
                    </div>
                    <p>3,200+ happy couples</p>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">30-day guarantee</p>
                  <p>Love it or return it</p>
                </div>
              </div>
            </div>

            {/* Right Content - Image Upload Section */}
            <div className={`mt-12 lg:mt-0 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Main Hero Image or Upload Area */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300">
                  {/* Replace this div with your actual hero image */}
                  <div className="w-full h-[500px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                      <Upload size={32} className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Your Photos</h3>
                    <p className="text-gray-600 mb-4 max-w-sm">
                      Drop 1-4 high-quality photos here to create your personalized 3D miniatures
                    </p>
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                      Choose Photos
                    </button>
                    <p className="text-sm text-gray-500 mt-3">Or drag and drop files here</p>
                  </div>
                </div>

                {/* Floating pricing card */}
                <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-1">$89</div>
                    <p className="text-xs text-gray-600 font-medium">Complete Kit</p>
                  </div>
                </div>

                {/* Floating testimonial */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 max-w-xs">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">"Perfect date night!"</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Sarah & Mike</p>
                      <p className="text-xs text-gray-500">Verified Purchase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📸",
                title: "Just Upload Photos",
                description: "Send us 1-4 high-quality photos and we'll handle the 3D modeling"
              },
              {
                icon: "🎨",
                title: "Everything Included",
                description: "Custom miniatures, premium paints, brushes, and detailed instructions"
              },
              {
                icon: "💕",
                title: "Create Together",
                description: "Perfect bonding activity for couples, families, and friends"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;