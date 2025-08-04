
import React from 'react';

interface PageWrapperProps {
  title?: string;
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h1 className="text-3xl font-bold text-kargo-teal mb-8 text-center">
            {title}
          </h1>
        )}
        <div className="bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageWrapper;
