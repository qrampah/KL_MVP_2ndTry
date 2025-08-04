
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-kargo-dark-blue">
      {/* Header Section */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-kargo-teal">Kargoline</h1>
        <div className="space-x-3">
          <Link to="/auth?mode=login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="primary">Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
          {/* Left Text Content */}
          <div className="text-center md:text-left py-12">
            <h2 className="text-5xl md:text-6xl font-extrabold">
              <span className="block text-kargo-teal">Kargoline:</span>
              <span className="block text-gray-100 mt-2">Moving the Economy</span>
            </h2>
            <p className="mt-6 text-lg text-gray-300 max-w-md mx-auto md:mx-0">
              The On-Demand Logistics Platform for U.S. and Africa.
              Connecting Truck Owners with People Who Need to Move Bulky Goods.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Founder: Sylvester Krampah.
            </p>
            <div className="mt-8 flex justify-center md:justify-start space-x-4">
              <Link to="/auth?mode=signup">
                <Button variant="primary" className="text-lg px-8 py-3">Get Started</Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button variant="secondary" className="text-lg px-8 py-3">I'm a Driver</Button>
              </Link>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="hidden md:block relative">
            <img 
              src="https://picsum.photos/seed/kargotruck/600/400" 
              alt="Blurred truck" 
              className="rounded-lg shadow-2xl object-cover w-full h-auto aspect-[3/2]"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
             {/* Simulate the blurred effect of the truck in the example */}
            <div className="absolute inset-0 backdrop-blur-sm rounded-lg"></div>
          </div>
        </div>
      </main>

      {/* Footer Section (Simplified) */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Kargoline. All rights reserved.</p>
        <p className="mt-1">Inspired by Sylvester Krampah.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
