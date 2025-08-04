import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../hooks/useJobs';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { DriverProfileData, Job } from '../types';
import { KARGO_COMMISSION_RATE } from '../constants';

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// A self-contained component for a job card to handle its own interaction state.
const JobCard: React.FC<{ job: Job }> = ({ job }) => {
    const { currentUser } = useAuth();
    const { acceptJob, isLoading: isJobContextLoading } = useJobs();
    const navigate = useNavigate();
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        if (!currentUser) return;
        setIsAccepting(true);
        setError(null);
        try {
            await acceptJob(job.id, currentUser.id);
            // On success, navigate to the job details page to start the workflow
            navigate(`/job/${job.id}`);
        } catch (err: any) {
            setError(err.message || "Failed to accept job.");
            setIsAccepting(false); // Allow retry on error
        }
    };

    const earnings = job.estimatedPrice * (1 - KARGO_COMMISSION_RATE);

    return (
        <div className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col gap-4">
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4 flex-grow">
                    {job.goodsPhotos.length > 0 && <CameraIcon />}
                    <div>
                        <p className="font-bold text-lg text-gray-100">{job.goodsDescription}</p>
                        <p className="text-sm text-gray-400">{job.pickupAddress} ➔ {job.dropoffAddress}</p>
                        <p className="text-xs text-gray-500 mt-1">Distance: ~{job.estimatedDistance} miles</p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-xl text-green-400">${earnings.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Est. Earnings</p>
                </div>
            </div>
            <div className="pt-3 border-t border-slate-600 flex justify-end items-center gap-3">
                <Link to={`/job/${job.id}`}>
                    <Button variant="secondary" className="py-1 px-3 text-sm">View Details</Button>
                </Link>
                <Button 
                    variant="primary" 
                    className="py-1 px-3 text-sm"
                    onClick={handleAccept}
                    isLoading={isAccepting}
                    disabled={isJobContextLoading || isAccepting}
                >
                    Accept Job
                </Button>
            </div>
        </div>
    );
};


const AvailableJobsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { jobs, getAvailableJobsForDriver, isLoading } = useJobs();
    
    const availableJobs = useMemo(() => currentUser ? getAvailableJobsForDriver(currentUser) : [], [currentUser, jobs, getAvailableJobsForDriver]);

    const driverProfile = currentUser?.profileData as DriverProfileData;

    const renderContent = () => {
        if (isLoading) return <Spinner />;
        if (!driverProfile?.truck) {
            return (
                <div className="text-center p-8 bg-slate-700 rounded-lg">
                    <p className="text-yellow-400">Please add your truck details in your <Link to="/profile" className="underline font-semibold">profile</Link> to see jobs.</p>
                </div>
            );
        }
        if (!driverProfile.isAvailable) {
            return (
                <div className="text-center p-8 bg-slate-700 rounded-lg">
                    <p className="text-gray-300">You are currently offline.</p>
                    <Link to="/dashboard">
                        <Button className="mt-4">Go Online on Dashboard</Button>
                    </Link>
                </div>
            );
        }
        if (availableJobs.length === 0) {
            return (
                 <div className="text-center p-8 bg-slate-700 rounded-lg">
                    <p className="text-gray-300">No jobs available right now that match your truck type. Check back soon!</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {availableJobs.map(job => (
                   <JobCard key={job.id} job={job} />
                ))}
           </div>
        );
    };

    return (
        <PageWrapper title="Available Jobs">
            {renderContent()}
        </PageWrapper>
    );
};

export default AvailableJobsPage;
