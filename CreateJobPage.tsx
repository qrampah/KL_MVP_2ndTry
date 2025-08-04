import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../components/layout/PageWrapper';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { TruckType, Job } from '../types';
import { TRUCK_TYPES_OPTIONS, PRICING, TRUCK_SPECS, TRUCK_IMAGE_URLS } from '../constants';

const CreateJobPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [jobDetails, setJobDetails] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    goodsDescription: '',
    truckTypeRequested: TruckType.PICKUP,
    goodsPhotos: [] as string[], // base64 strings
  });
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { createJob, isLoading } = useJobs();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleInputChange = (field: keyof typeof jobDetails, value: any) => {
    setJobDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!jobDetails.pickupAddress || !jobDetails.dropoffAddress || !jobDetails.goodsDescription) {
        setError('Please fill in all address and description fields.');
        return;
      }
      // Simulate distance calculation for pricing
      setEstimatedDistance(Math.floor(Math.random() * 50) + 5);
    }
    setStep(s => s + 1);
  };

  const handlePrevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setError(null);
    if (!currentUser) {
      setError("You must be logged in to create a job.");
      return;
    }
    try {
      const estimatedPrice = PRICING[jobDetails.truckTypeRequested].baseFare + (PRICING[jobDetails.truckTypeRequested].perMileRate * estimatedDistance);
      const jobData = { ...jobDetails, estimatedPrice, estimatedDistance };
      await createJob(jobData);
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err: any) {
      setError(err.message || "Failed to create job.");
    }
  };
  
  const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  videoRef.current.play();
                  setIsCameraOpen(true);
              }
          } catch (err) {
              console.error("Error accessing camera:", err);
              setError("Could not access the camera. Please check permissions.");
          }
      }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOpen(false);
    }
  };

  const takePicture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          handleInputChange('goodsPhotos', [...jobDetails.goodsPhotos, dataUrl]);
          stopCamera();
      }
  };


  return (
    <PageWrapper title="Create a New Shipment">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300">Step {step} of 3</h3>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {step === 1 && (
        <div>
          <h4 className="text-xl font-semibold text-kargo-teal mb-4">Shipment Details</h4>
          <InputField label="Pickup Address" id="pickupAddress" value={jobDetails.pickupAddress} onChange={e => handleInputChange('pickupAddress', e.target.value)} required />
          <InputField label="Dropoff Address" id="dropoffAddress" value={jobDetails.dropoffAddress} onChange={e => handleInputChange('dropoffAddress', e.target.value)} required />
          <InputField label="Brief Description of Goods" id="goodsDescription" value={jobDetails.goodsDescription} onChange={e => handleInputChange('goodsDescription', e.target.value)} required />
           <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Photos of Goods ({jobDetails.goodsPhotos.length}/3)</h5>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {jobDetails.goodsPhotos.map((photo, index) => <img key={index} src={photo} alt={`Goods photo ${index + 1}`} className="rounded-md object-cover h-24 w-full" />)}
              </div>
              {jobDetails.goodsPhotos.length < 3 && !isCameraOpen && <Button type="button" variant="secondary" onClick={startCamera}>Add Photo</Button>}
           </div>

          {isCameraOpen && (
              <div className="mt-4 p-2 bg-slate-700 rounded-lg">
                  <video ref={videoRef} className="w-full rounded-md" playsInline />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="flex justify-center space-x-2 mt-2">
                      <Button type="button" onClick={takePicture}>Take Picture</Button>
                      <Button type="button" variant="secondary" onClick={stopCamera}>Cancel</Button>
                  </div>
              </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h4 className="text-xl font-semibold text-kargo-teal mb-4">Select Truck Type</h4>
          <p className="text-sm text-gray-400 mb-4">Estimated distance: {estimatedDistance} miles. Prices are estimates and may vary.</p>
          <div className="space-y-4">
            {TRUCK_TYPES_OPTIONS.map(opt => {
              const type = opt.value as TruckType;
              const price = PRICING[type].baseFare + PRICING[type].perMileRate * estimatedDistance;
              const isSelected = jobDetails.truckTypeRequested === type;
              return (
                <div key={type} onClick={() => handleInputChange('truckTypeRequested', type)} className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex flex-col md:flex-row gap-4 items-center ${isSelected ? 'border-kargo-teal bg-teal-900/20' : 'border-slate-600 hover:border-slate-500'}`}>
                   <img src={TRUCK_IMAGE_URLS[type]} alt={opt.label} className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-grow">
                    <h5 className="font-bold text-lg">{opt.label}</h5>
                    <p className="text-sm text-gray-400">Capacity: {TRUCK_SPECS[type].maxPayloadLbs} lbs / {TRUCK_SPECS[type].maxVolumeCubicFt} cu ft</p>
                  </div>
                   <p className="font-semibold text-xl text-kargo-teal md:ml-4">${price.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h4 className="text-xl font-semibold text-kargo-teal mb-4">Review & Confirm</h4>
          <div className="space-y-3 bg-slate-700 p-4 rounded-lg">
            <p><strong>From:</strong> {jobDetails.pickupAddress}</p>
            <p><strong>To:</strong> {jobDetails.dropoffAddress}</p>
            <p><strong>Goods:</strong> {jobDetails.goodsDescription}</p>
            <p><strong>Truck:</strong> {jobDetails.truckTypeRequested}</p>
            <p className="font-bold text-lg"><strong>Estimated Price:</strong> ${ (PRICING[jobDetails.truckTypeRequested].baseFare + PRICING[jobDetails.truckTypeRequested].perMileRate * estimatedDistance).toFixed(2) }</p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {jobDetails.goodsPhotos.map((photo, index) => <img key={index} src={photo} alt={`Review photo ${index + 1}`} className="rounded-md object-cover h-24 w-full" />)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between">
        {step > 1 && <Button onClick={handlePrevStep} variant="secondary" disabled={isLoading}>Back</Button>}
        <div /> 
        {step < 3 && <Button onClick={handleNextStep} disabled={isLoading}>Next</Button>}
        {step === 3 && <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading}>Request Kargo</Button>}
      </div>
    </PageWrapper>
  );
};

export default CreateJobPage;