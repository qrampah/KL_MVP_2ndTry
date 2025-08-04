import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../hooks/useJobs';
import { useNotification } from '../hooks/useNotification';
import PageWrapper from '../components/layout/PageWrapper';
import { UserRole, JobStatus, User, DriverProfileData, Job } from '../types';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { KARGO_COMMISSION_RATE } from '../constants';
import JobStatusBadge from '../components/ui/JobStatusBadge';

const ShipperDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { getJobsForShipper, isLoading } = useJobs();
  const shipperJobs = getJobsForShipper(userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-slate-700 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-kargo-teal">My Shipments</h2>
        <Link to="/create-job">
          <Button variant="primary">Create New Shipment</Button>
        </Link>
      </div>
      {isLoading ? <p>Loading shipments...</p> : (
        shipperJobs.length > 0 ? (
          <div className="space-y-3">
            {shipperJobs.map(job => (
              <Link to={`/job/${job.id}`} key={job.id} className="block bg-slate-600 p-4 rounded-lg hover:bg-slate-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-100">{job.goodsDescription}</p>
                    <p className="text-sm text-gray-400">To: {job.dropoffAddress}</p>
                    <p className="text-sm text-gray-400">Requested: {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">You haven't created any shipments yet.</p>
        )
      )}
    </div>
  );
};

const DriverDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { updateUserProfile, isLoading: isAuthLoading } = useAuth();
  const { jobs, getAvailableJobsForDriver, isLoading: areJobsLoading } = useJobs();
  const { addNotification } = useNotification();
  const driverProfile = user.profileData as DriverProfileData;
  const [previousAvailableJobsCount, setPreviousAvailableJobsCount] = useState(0);

  const handleAvailabilityToggle = async () => {
    const updatedProfileData = { ...driverProfile, isAvailable: !driverProfile.isAvailable };
    const updatedUser = { ...user, profileData: updatedProfileData };
    await updateUserProfile(updatedUser);
  };
  
  const availableJobs = useMemo(() => getAvailableJobsForDriver(user), [jobs, user]);
  
  const activeJob = useMemo(() => 
    jobs.find(j => j.driverId === user.id && j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELLED),
  [jobs, user.id]);

  useEffect(() => {
    // Only trigger notification if the driver is online and the number of jobs has increased
    if (driverProfile.isAvailable && availableJobs.length > previousAvailableJobsCount) {
        addNotification("New Job Available!", 'success', '/jobs/available');
    }
    setPreviousAvailableJobsCount(availableJobs.length);
  }, [availableJobs.length, driverProfile.isAvailable, addNotification, previousAvailableJobsCount]);


  return (
    <div className="space-y-6">
      <div className="bg-slate-700 p-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-kargo-teal">Driver Hub</h2>
          <p className={`text-sm ${driverProfile.isAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
            You are currently {driverProfile.isAvailable ? 'Online' : 'Offline'}.
          </p>
        </div>
        <label htmlFor="availability-toggle" className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="availability-toggle" className="sr-only peer" checked={driverProfile.isAvailable} onChange={handleAvailabilityToggle} disabled={isAuthLoading} />
          <div className="w-14 h-8 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-kargo-teal/50 peer-checked:bg-kargo-teal"></div>
          <span className="absolute left-1 top-1 h-6 w-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
        </label>
      </div>

      {activeJob && (
        <div className="bg-slate-700 p-6 rounded-lg">
           <h3 className="text-lg font-semibold text-kargo-teal mb-3">My Active Job</h3>
           <Link to={`/job/${activeJob.id}`} className="block bg-slate-600 p-4 rounded-lg hover:bg-slate-500 transition-colors">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-100">{activeJob.goodsDescription}</p>
                    <p className="text-sm text-gray-400">To: {activeJob.dropoffAddress}</p>
                  </div>
                  <JobStatusBadge status={activeJob.status} />
              </div>
            </Link>
        </div>
      )}

      <div className="bg-slate-700 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Job Marketplace</h3>
        {areJobsLoading ? <p>Searching for jobs...</p> :
         !driverProfile.truck ? <p className="text-yellow-400 text-sm">Please add your truck details in your <Link to="/profile" className="underline">profile</Link> to see jobs.</p> :
         !driverProfile.isAvailable ? <p className="text-gray-300 text-sm">Go online to see available jobs.</p> :
         (
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{availableJobs.length}</p>
            <p className="text-gray-400 mb-4">jobs available that match your truck</p>
            <Link to="/jobs/available">
              <Button>View Available Jobs</Button>
            </Link>
          </div>
         )
        }
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <PageWrapper title="Loading..."><p>Loading user data...</p></PageWrapper>;
  }

  return (
    <PageWrapper title={`Welcome, ${currentUser.name}!`}>
      <div className="space-y-6">
        <p className="text-lg text-gray-300">
          You are logged in as a <span className="font-semibold text-kargo-teal">{currentUser.role}</span>.
        </p>

        {currentUser.role === UserRole.SHIPPER && <ShipperDashboard userId={currentUser.id} />}
        {currentUser.role === UserRole.DRIVER && <DriverDashboard user={currentUser} />}

        <div className="mt-8 text-center">
          <Link to="/profile">
            <Button className="mt-2" variant="secondary">Go to My Profile</Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;