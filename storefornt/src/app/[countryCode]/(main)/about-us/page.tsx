'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Heart, Palette, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

const AboutUsPage = () => {
  const { countryCode } = useParams();

  const founders = [
    {
      name: 'Kush Patel',
      role: 'Co-Founder & CTO',
      image: '/img/team/you.jpg',
      bio: 'AI expert and 3D printing enthusiast who turned a passion project into a business. Handles all things technology and operations.'
    },
    {
      name: "Freya Suthar",
      role: 'Co-Founder & CEO',
      image: '/img/team/wife.jpg',
      bio: 'Creative visionary who saw the potential in turning 3D miniatures into meaningful experiences. Leads business strategy and customer experience.'
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: 'Passion for Quality',
      description: 'We take pride in every miniature we create, ensuring the highest quality in every detail.'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: 'Innovation',
      description: 'Constantly pushing the boundaries of 3D printing technology to deliver exceptional results.'
    },
    {
      icon: <Palette className="w-8 h-8 text-blue-500" />,
      title: 'Creativity',
      description: 'Bringing your memories to life with artistic vision and attention to detail.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Community',
      description: 'Building connections through shared creative experiences and memories.'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/90 to-purple-600/90 backdrop-blur-sm"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Our Love Story</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-pink-100 leading-relaxed">
            How a passion for AI, 3D printing, and quality time together created Minimica
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How It All Began
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto"></div>
          </div>

          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <p>
              Minimica began with a simple idea: what if we could combine my passion for AI with my wife's creative spirit to create something truly special? As someone who works with AI during the day, I found myself constantly thinking about its potential applications beyond my 9-to-5.
            </p>
            
            <p>
              One evening, as I was tinkering with some 3D modeling software, a thought struck me: <span className="font-medium text-gray-900">why can't we use AI to generate 3D models from photos?</span> The idea of creating miniature versions of people we love seemed both technically challenging and emotionally rewarding.
            </p>

            <div className="bg-pink-50 p-6 rounded-xl border-l-4 border-pink-400 my-8">
              <p className="italic text-pink-800">
                "What if we could turn our favorite photos into paintable miniatures?"
              </p>
            </div>

            <p>
              When I shared this idea with my wife, she immediately saw the potential for something more than just a technical achievement. She suggested making it a date night activity - we could create miniatures of each other and spend an evening painting them together. That weekend, we went to Hobby Lobby, picked up some paint and primer, opened a bottle of wine, and had one of the most memorable date nights we'd had in years.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl text-gray-900 mb-3">The Lightbulb Moment</h3>
                <p className="text-gray-600">
                  As we sat there, carefully painting the tiny details of each other's miniatures, laughing at our artistic attempts, we realized something important: this wasn't just about the technology. It was about the experience, the quality time together, and the joy of creating something with our own hands.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl text-gray-900 mb-3">Birth of Minimica</h3>
                <p className="text-gray-600">
                  That's when we knew we had to share this experience with others. What if we could help other couples, families, and friends create these special moments together? And just like that, Minimica was born - a way to combine cutting-edge AI with the timeless joy of creative connection.
                </p>
              </div>
            </div>

            <p>
              Today, Minimica is more than just a business - it's our way of helping others create meaningful connections through creativity. Every miniature we create is infused with the same love and attention to detail that went into that very first date night.
            </p>

            <p className="text-center mt-12">
              <Link 
                href={`/${countryCode}/how-it-works`}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-sm transition-all duration-300"
              >
                Create Your Own Memory
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              What drives us to create magical experiences for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-opacity-10 mb-4" style={{ backgroundColor: `${value.icon.props.className.includes('pink') ? 'rgba(236, 72, 153, 0.1)' : value.icon.props.className.includes('purple') ? 'rgba(168, 85, 247, 0.1)' : value.icon.props.className.includes('blue') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)'}` }}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* First Creation Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our First Creation
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">The Beginning of Something Special</h3>
              <p className="text-gray-600 leading-relaxed">
                This was our very first miniature. 
                We spent hours painting the tiny details, laughing at our artistic attempts, and 
                enjoying each other's company over a bottle of wine.
              </p>
              <p className="text-gray-600 leading-relaxed">
                What started as a fun experiment became the foundation of Minimica. We realized 
                that the real magic wasn't just in the miniatures themselves, but in the 
                connections and memories they helped create.
              </p>
              <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                <p className="text-pink-700 italic">
                  "It's not perfect, but it's ours - just like our journey together."
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-square relative">
                <Image
                  src="/img/about/first-creation.jpg"
                  alt="Our first miniature creation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet the Founders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A husband and wife team on a mission to bring people together through creativity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <div className="aspect-square relative bg-gradient-to-br from-pink-50 to-purple-50">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center text-pink-300">
                    <span className="text-4xl">{founder.name.charAt(0)}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900">{founder.name}</h3>
                <p className="text-purple-600 font-medium mb-4">{founder.role}</p>
                <p className="text-gray-600">{founder.bio}</p>
                
                {founder.role.includes('CTO') && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Favorite part:</span> Building the technology that makes the magic happen
                    </p>
                  </div>
                )}
                
                {founder.role.includes('CEO') && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Favorite part:</span> Hearing stories from couples who've had memorable date nights with our miniatures
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center max-w-3xl mx-auto bg-pink-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Promise to You</h3>
          <p className="text-gray-600 mb-6">
            As fellow creatives and partners in both business and life, we pour our hearts into every miniature we create. 
            We're committed to helping you create special moments and lasting memories with your loved ones.
          </p>
          <p className="text-gray-500 italic">
            - The Minimica Founders
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Mini Masterpiece?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who've turned their memories into cherished keepsakes.
          </p>
          <Link
            href={`/${countryCode}/store`}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-pink-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Creating Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
