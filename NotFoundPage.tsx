
import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <PageWrapper title="Page Not Found">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-kargo-teal mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a.5.5 0 01.5-.5h0a.5.5 0 01.5.5v0a.5.5 0 01-.5.5h0a.5.5 0 01-.5-.5zM15 10a.5.5 0 01.5-.5h0a.5.5 0 01.5.5v0a.5.5 0 01-.5.5h0a.5.5 0 01-.5-.5z" />
        </svg>
        <p className="text-xl text-gray-300 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button variant="primary">Go to Homepage</Button>
        </Link>
      </div>
    </PageWrapper>
  );
};

export default NotFoundPage;
