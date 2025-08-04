
import { useContext } from 'react';
import { JobContext } from '../contexts/JobContext';
import type { JobContextType } from '../types';

export const useJobs = (): JobContextType => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
