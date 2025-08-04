import React, { useMemo } from 'react';
import { JobStatus } from '../../types';

interface MapSimulationProps {
  jobStatus: JobStatus;
}

const MapSimulation: React.FC<MapSimulationProps> = ({ jobStatus }) => {
  const truckPosition = useMemo(() => {
    switch (jobStatus) {
      case JobStatus.ACCEPTED:
        return { top: '50%', left: '10%', transform: 'translateY(-50%) rotate(0deg)' }; // At start
      case JobStatus.INPROGRESS_TO_PICKUP:
        return { top: '50%', left: '10%', transform: 'translateY(-50%) rotate(0deg)' }; // At start
      case JobStatus.INPROGRESS_TO_DROPOFF:
        return { top: '50%', left: '85%', transform: 'translateY(-50%) rotate(0deg)' }; // At end
      case JobStatus.COMPLETED:
        return { top: '50%', left: '85%', transform: 'translateY(-50%) rotate(0deg)' }; // At end
      default:
        return { top: '50%', left: '10%', transform: 'translateY(-50%) rotate(0deg)' };
    }
  }, [jobStatus]);
  
  const isTripActive = jobStatus === JobStatus.INPROGRESS_TO_DROPOFF;

  return (
    <div className="bg-slate-700 p-4 sm:p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-kargo-teal mb-4">Live Tracking (Simulation)</h3>
      <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden">
        {/* Mock Map Background */}
        <img 
            src="https://picsum.photos/seed/mapbg/800/400" 
            alt="Map background" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        {/* Dotted Line for Route */}
        <div 
          className="absolute top-1/2 left-[15%] w-[70%] h-px bg-repeat-x bg-center" 
          style={{ backgroundImage: `linear-gradient(to right, ${isTripActive ? '#00A99D' : '#94a3b8'} 50%, transparent 50%)`, backgroundSize: '10px 1px' }}
        ></div>

        {/* Pickup Pin */}
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 text-center text-xs">
          <LocationPin color="#34D399" />
          <span className="text-gray-300 font-medium mt-1 inline-block">Pickup</span>
        </div>

        {/* Dropoff Pin */}
        <div className="absolute top-1/2 left-[85%] -translate-y-1/2 text-center text-xs">
          <LocationPin color="#F87171" />
          <span className="text-gray-300 font-medium mt-1 inline-block">Dropoff</span>
        </div>
        
        {/* Truck Marker */}
        {(jobStatus !== JobStatus.PENDING && jobStatus !== JobStatus.CANCELLED) && (
            <div className="truck-marker absolute" style={truckPosition}>
                <TruckIcon color={isTripActive ? '#00A99D' : '#94a3b8'}/>
            </div>
        )}
      </div>
    </div>
  );
};

const LocationPin: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const TruckIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-8.5l1.96 2.5H17V9.5h2.5zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);


export default MapSimulation;