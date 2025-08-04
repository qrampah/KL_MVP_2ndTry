import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Job, JobContextType, JobStatus, UserRole, User, DriverProfileData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { KARGO_COMMISSION_RATE, PRICING } from '../constants';

const JOBS_STORAGE_KEY = 'kargolineJobsDB';

export const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  // Poll for changes to simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const storedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
      if (storedJobs) {
        const latestJobs: Job[] = JSON.parse(storedJobs);
        const currentJobs = jobsRef.current;
        
        if (JSON.stringify(latestJobs) !== JSON.stringify(currentJobs)) {
          // Check for status changes on my jobs
          latestJobs.forEach(latestJob => {
            const currentJob = currentJobs.find(j => j.id === latestJob.id);
            if (currentJob && currentJob.status !== latestJob.status) {
              if (currentUser?.id === latestJob.shipperId) {
                addNotification(`Your shipment to ${latestJob.dropoffAddress} is now ${latestJob.status}.`, 'info', `/job/${latestJob.id}`);
              }
               if (currentUser?.id === latestJob.driverId) {
                addNotification(`Job for ${latestJob.dropoffAddress} is now ${latestJob.status}.`, 'info', `/job/${latestJob.id}`);
              }
            }
          });
          setJobs(latestJobs);
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [currentUser, addNotification]);
  
  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
      if (storedJobs) {
        setJobs(JSON.parse(storedJobs));
      }
    } catch (error) {
      console.error("Failed to load jobs from localStorage", error);
      localStorage.removeItem(JOBS_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);
  
  const updateAndPersistJobs = (updatedJobs: Job[]) => {
    setJobs(updatedJobs);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
  };

  const createJob = useCallback(async (jobData: Omit<Job, 'id' | 'shipperId' | 'driverId' | 'status' | 'finalFare' | 'commission' | 'createdAt' | 'acceptedAt' | 'startedTripAt' | 'completedAt' | 'shipperRating' | 'shipperReview' | 'driverRating' | 'driverReview'>): Promise<Job> => {
    if (!currentUser || currentUser.role !== UserRole.SHIPPER) {
      throw new Error("Only shippers can create jobs.");
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      shipperId: currentUser.id,
      driverId: null,
      status: JobStatus.PENDING,
      finalFare: null,
      commission: jobData.estimatedPrice * KARGO_COMMISSION_RATE,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      startedTripAt: null,
      completedAt: null,
      shipperRating: null,
      shipperReview: null,
      driverRating: null,
      driverReview: null,
    };
    
    const updatedJobs = [...jobs, newJob];
    updateAndPersistJobs(updatedJobs);
    setIsLoading(false);
    return newJob;
  }, [jobs, currentUser]);

  const getJobById = useCallback((id: string) => {
    return jobs.find(job => job.id === id);
  }, [jobs]);

  const getJobsForShipper = useCallback((shipperId: string) => {
    return jobs.filter(job => job.shipperId === shipperId);
  }, [jobs]);

  const getAvailableJobsForDriver = useCallback((driver: User): Job[] => {
    if (driver.role !== UserRole.DRIVER) return [];
    const driverProfile = driver.profileData as DriverProfileData;
    if (!driverProfile.isAvailable || !driverProfile.truck) return [];
    
    return jobs.filter(job => 
        job.status === JobStatus.PENDING &&
        job.truckTypeRequested === driverProfile.truck?.type
    );
  }, [jobs]);

  const acceptJob = useCallback(async (jobId: string, driverId: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 750));
    
    const jobToAccept = jobs.find(j => j.id === jobId);
    if (!jobToAccept) throw new Error("Job not found.");
    if (jobToAccept.status !== JobStatus.PENDING) throw new Error("Job is no longer available.");

    const updatedJobs = jobs.map(j => 
      j.id === jobId ? { ...j, status: JobStatus.ACCEPTED, driverId, acceptedAt: new Date().toISOString() } : j
    );
    updateAndPersistJobs(updatedJobs);
    addNotification(`You accepted a new job for ${jobToAccept.dropoffAddress}.`, 'success', `/job/${jobId}`);
    setIsLoading(false);
  }, [jobs, addNotification]);

  const updateJobStatus = useCallback(async (jobId: string, newStatus: JobStatus): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) throw new Error("Job not found.");
    
    let updatedJobData: Partial<Job> = { status: newStatus };

    if (newStatus === JobStatus.INPROGRESS_TO_DROPOFF) {
        updatedJobData.startedTripAt = new Date().toISOString();
    }
    
    if (newStatus === JobStatus.COMPLETED) {
        updatedJobData.completedAt = new Date().toISOString();
        if (jobToUpdate.startedTripAt) {
            const startTime = new Date(jobToUpdate.startedTripAt).getTime();
            const endTime = new Date(updatedJobData.completedAt).getTime();
            const durationMinutes = Math.max(1, (endTime - startTime) / (1000 * 60)); // ensure at least 1 minute
            
            const pricingInfo = PRICING[jobToUpdate.truckTypeRequested];
            const finalFare = pricingInfo.baseFare + 
                              (pricingInfo.perMileRate * jobToUpdate.estimatedDistance) + 
                              (pricingInfo.perMinuteRate * durationMinutes);

            updatedJobData.finalFare = finalFare;
            updatedJobData.commission = finalFare * KARGO_COMMISSION_RATE;
        }
    }

    const updatedJobs = jobs.map(j => 
      j.id === jobId ? { ...j, ...updatedJobData } : j
    );
    updateAndPersistJobs(updatedJobs);
    setIsLoading(false);
  }, [jobs]);

  const cancelJob = useCallback(async (jobId: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const jobToCancel = jobs.find(j => j.id === jobId);

    if (!jobToCancel) {
      throw new Error("Job not found.");
    }
    if (jobToCancel.shipperId !== currentUser?.id) {
      throw new Error("You are not authorized to cancel this job.");
    }
    if (jobToCancel.status !== JobStatus.PENDING && jobToCancel.status !== JobStatus.ACCEPTED) {
        throw new Error("Job can only be cancelled if it's pending or accepted by a driver.");
    }

    const updatedJobs = jobs.map(j => 
        j.id === jobId ? { ...j, status: JobStatus.CANCELLED } : j
    );
    updateAndPersistJobs(updatedJobs);
    setIsLoading(false);
  }, [jobs, currentUser]);
  
  const submitRating = useCallback(async (jobId: string, rating: number, review: string, ratedBy: UserRole) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedJobs = jobs.map(j => {
      if (j.id === jobId) {
        if (ratedBy === UserRole.SHIPPER) {
          return { ...j, driverRating: rating, driverReview: review };
        } else if (ratedBy === UserRole.DRIVER) {
          return { ...j, shipperRating: rating, shipperReview: review };
        }
      }
      return j;
    });

    updateAndPersistJobs(updatedJobs);
    setIsLoading(false);
  }, [jobs]);

  return (
    <JobContext.Provider value={{ jobs, isLoading, createJob, getJobById, getJobsForShipper, getAvailableJobsForDriver, acceptJob, updateJobStatus, cancelJob, submitRating }}>
      {children}
    </JobContext.Provider>
  );
};