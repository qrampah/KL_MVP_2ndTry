
import React from 'react';
import { JobStatus } from '../../types';

const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const statusColors: Record<JobStatus, string> = {
    [JobStatus.PENDING]: 'bg-yellow-600 text-yellow-100',
    [JobStatus.ACCEPTED]: 'bg-blue-600 text-blue-100',
    [JobStatus.INPROGRESS_TO_PICKUP]: 'bg-indigo-600 text-indigo-100',
    [JobStatus.INPROGRESS_TO_DROPOFF]: 'bg-purple-600 text-purple-100',
    [JobStatus.COMPLETED]: 'bg-green-600 text-green-100',
    [JobStatus.CANCELLED]: 'bg-red-600 text-red-100',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
      {status}
    </span>
  );
};

export default JobStatusBadge;
