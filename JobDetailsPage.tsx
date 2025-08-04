import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { JobStatus, UserRole } from '../types';
import { KARGO_COMMISSION_RATE } from '../constants';
import JobStatusBadge from '../components/ui/JobStatusBadge';
import RatingForm from '../components/jobs/RatingForm';
import StarRating from '../components/ui/StarRating';
import MapSimulation from '../components/jobs/MapSimulation';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, cancelJob, acceptJob, updateJobStatus, submitRating, isLoading: isJobLoading } = useJobs();
  const { currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!id) {
    return <PageWrapper title="Error"><p>No job ID provided.</p></PageWrapper>;
  }

  const job = getJobById(id);

  const handleCancelJob = async () => {
    setError(null); setSuccess(null);
    if (!job) return;
    try {
      await cancelJob(job.id);
      setSuccess("Job has been successfully cancelled.");
    } catch (err: any) { setError(err.message || "Failed to cancel job."); }
  };
  
  const handleAcceptJob = async () => {
    setError(null); setSuccess(null);
    if (!job || !currentUser) return;
    try {
      await acceptJob(job.id, currentUser.id);
      setSuccess("Job accepted! You can now proceed to pickup.");
      // No navigate here, let user see the updated page.
    } catch (err: any) { setError(err.message || "Failed to accept job."); }
  };
  
  const handleUpdateStatus = async (newStatus: JobStatus) => {
    setError(null); setSuccess(null);
    if (!job) return;
    try {
      await updateJobStatus(job.id, newStatus);
      setSuccess(`Job status updated to: ${newStatus}`);
    } catch (err: any) { setError(err.message || "Failed to update status."); }
  };

  const handleRatingSubmit = async (rating: number, review: string) => {
    setError(null); setSuccess(null);
    if (!job || !currentUser) return;
    try {
        await submitRating(job.id, rating, review, currentUser.role);
        setSuccess("Thank you for your feedback!");
    } catch (err: any) {
        setError(err.message || "Failed to submit rating.");
    }
  };

  if (isJobLoading && !job) {
    return <PageWrapper><Spinner /></PageWrapper>;
  }

  if (!job) {
    return <PageWrapper title="Not Found"><p>Sorry, we couldn't find that job.</p></PageWrapper>;
  }
  
  const isShipper = currentUser?.id === job.shipperId;
  const isAssignedDriver = currentUser?.id === job.driverId;
  const isPotentialDriver = currentUser?.role === UserRole.DRIVER && job.status === JobStatus.PENDING;
  
  if (!isShipper && !isAssignedDriver && !isPotentialDriver) {
      return <PageWrapper title="Access Denied"><p>You are not authorized to view this page.</p></PageWrapper>;
  }
  
  const canBeCancelledByShipper = isShipper && (job.status === JobStatus.PENDING || job.status === JobStatus.ACCEPTED);

  const finalPrice = job.finalFare ?? job.estimatedPrice;
  const driverEarnings = finalPrice * (1 - (job.commission ?? KARGO_COMMISSION_RATE) / finalPrice);


  const renderDriverActions = () => {
    if (!currentUser || currentUser.role !== UserRole.DRIVER) return null;

    if (job.status === JobStatus.PENDING && isPotentialDriver) {
        return (
            <div className="flex space-x-4">
                <Button onClick={handleAcceptJob} isLoading={isJobLoading}>Accept Job</Button>
                <Button onClick={() => navigate('/dashboard')} variant="secondary">Decline</Button>
            </div>
        );
    }
    
    if (!isAssignedDriver) return null;

    switch (job.status) {
        case JobStatus.ACCEPTED:
            return <Button onClick={() => handleUpdateStatus(JobStatus.INPROGRESS_TO_PICKUP)} isLoading={isJobLoading}>Arrived at Pickup</Button>;
        case JobStatus.INPROGRESS_TO_PICKUP:
            return <Button onClick={() => handleUpdateStatus(JobStatus.INPROGRESS_TO_DROPOFF)} isLoading={isJobLoading}>Goods Loaded, Start Trip</Button>;
        case JobStatus.INPROGRESS_TO_DROPOFF:
            return <Button onClick={() => handleUpdateStatus(JobStatus.COMPLETED)} isLoading={isJobLoading}>Complete Delivery</Button>;
        default:
            return null;
    }
  };

  const renderRatingSection = () => {
    if (job.status !== JobStatus.COMPLETED) return null;

    if (isShipper) {
        if (job.driverRating === null) {
            return <RatingForm onSubmit={handleRatingSubmit} isLoading={isJobLoading} userRoleToRate="Driver" />;
        } else {
            return (
                <div className="bg-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-kargo-teal">Your Rating for the Driver</h3>
                    <StarRating rating={job.driverRating} disabled size={20} />
                    {job.driverReview && <p className="mt-2 text-gray-300 italic">"{job.driverReview}"</p>}
                </div>
            );
        }
    }

    if (isAssignedDriver) {
        if (job.shipperRating === null) {
            return <RatingForm onSubmit={handleRatingSubmit} isLoading={isJobLoading} userRoleToRate="Shipper" />;
        } else {
            return (
                <div className="bg-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-kargo-teal">Your Rating for the Shipper</h3>
                    <StarRating rating={job.shipperRating} disabled size={20} />
                    {job.shipperReview && <p className="mt-2 text-gray-300 italic">"{job.shipperReview}"</p>}
                </div>
            );
        }
    }
    return null;
  };

  return (
    <PageWrapper title={`Shipment Details`}>
        <div className="space-y-6">
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            {success && <Alert type="success" message={success} />}

            <div className="bg-slate-700 p-6 rounded-lg">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-kargo-teal mb-2">Job #{job.id.substring(0, 6)}...</h2>
                    <JobStatusBadge status={job.status} />
                </div>
                <div className="mt-4 space-y-2 text-gray-300">
                    <p><strong>From: </strong>{job.pickupAddress}</p>
                    <p><strong>To: </strong>{job.dropoffAddress}</p>
                    <p><strong>Goods: </strong>{job.goodsDescription}</p>
                    <p><strong>Truck Type: </strong>{job.truckTypeRequested}</p>
                    <p><strong>Requested On: </strong>{new Date(job.createdAt).toLocaleString()}</p>
                    
                     <p><strong>{job.finalFare ? 'Final Price' : 'Estimated Price'}: </strong>${finalPrice.toFixed(2)}</p>
                    
                    {currentUser?.role === UserRole.DRIVER && (
                      <p className="text-lg">
                        <strong>{job.finalFare ? 'Final Earnings' : 'Est. Earnings'}: </strong>
                        <span className="text-green-400 font-bold">${driverEarnings.toFixed(2)}</span>
                      </p>
                    )}

                </div>
                
                 {job.goodsPhotos.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-gray-200 mb-2">Photos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {job.goodsPhotos.map((photo, index) => (
                                <img key={index} src={photo} alt={`Goods photo ${index+1}`} className="rounded-lg object-cover w-full h-32" />
                            ))}
                        </div>
                    </div>
                 )}
            </div>
            
            <MapSimulation jobStatus={job.status} />
            
            {renderRatingSection()}
            
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
                <div className="flex space-x-4">
                  {isShipper && canBeCancelledByShipper && (
                      <Button onClick={handleCancelJob} variant="danger" isLoading={isJobLoading}>
                          Cancel Shipment
                      </Button>
                  )}
                  {renderDriverActions()}
                </div>
            </div>
        </div>
    </PageWrapper>
  );
};

export default JobDetailsPage;