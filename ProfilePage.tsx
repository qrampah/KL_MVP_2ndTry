import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../hooks/useJobs';
import PageWrapper from '../components/layout/PageWrapper';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import SelectField from '../components/ui/SelectField';
import Alert from '../components/ui/Alert';
import StarRating from '../components/ui/StarRating';
import { User, UserRole, TruckType, ShipperProfileData, DriverProfileData, Truck, UserDocument, JobStatus } from '../types';
import { TRUCK_TYPES_OPTIONS, TRUCK_SPECS, REQUIRED_DOCUMENTS } from '../constants';

const GeneralProfileInfo: React.FC<{ user: User, onUpdate: (field: keyof User, value: any) => void, disabled: boolean, averageRating: number | null, ratingCount: number }> = ({ user, onUpdate, disabled, averageRating, ratingCount }) => (
  <>
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
      <InputField label="Full Name" id="name" type="text" value={user.name} onChange={e => onUpdate('name', e.target.value)} disabled={disabled} containerClassName="flex-grow" />
      {averageRating !== null && (
        <div className="text-center sm:text-left">
          <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
          <div className="flex items-center gap-2 bg-slate-700 p-2 rounded-md">
            <StarRating rating={averageRating} disabled size={20} />
            <span className="text-gray-300 font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({ratingCount})</span>
          </div>
        </div>
      )}
    </div>
    <InputField label="Email Address" id="email" type="email" value={user.email} disabled readOnly containerClassName="opacity-70" />
    <InputField label="Phone Number" id="phone" type="tel" value={user.phone || ''} onChange={e => onUpdate('phone', e.target.value)} placeholder="e.g., +15551234567" disabled={disabled} />
  </>
);

const ReviewsList: React.FC<{ reviews: { review: string; rating: number }[] }> = ({ reviews }) => {
    if (reviews.length === 0) {
        return <p className="text-sm text-gray-400">No reviews yet.</p>;
    }
    return (
        <div className="space-y-3">
            {reviews.map((r, index) => (
                <div key={index} className="bg-slate-600 p-3 rounded-md">
                    <StarRating rating={r.rating} disabled size={16} />
                    <p className="text-gray-200 mt-1 italic">"{r.review}"</p>
                </div>
            ))}
        </div>
    );
};

const ShipperSpecificProfile: React.FC<{ profile: ShipperProfileData, onUpdate: (field: keyof ShipperProfileData, value: any) => void, disabled: boolean, reviews: { review: string; rating: number }[] }> = ({ profile, onUpdate, disabled, reviews }) => (
  <div className="mt-6 pt-6 border-t border-slate-700">
    <h3 className="text-lg font-semibold text-kargo-teal mb-3">Payment Methods (UI Only)</h3>
    {profile.paymentMethods.length === 0 ? <p className="text-sm text-gray-400">No payment methods added.</p> : (
      profile.paymentMethods.map(pm => <div key={pm.id} className="text-sm text-gray-300 p-2 bg-slate-600 rounded mb-1">{pm.type} ending in {pm.last4} (Exp: {pm.expiry})</div>)
    )}
    <Button onClick={() => alert("UI only: Add payment method")} className="mt-2 text-sm py-1 px-2" variant="secondary" disabled={disabled}>Add Payment Method</Button>
    
    <div className="mt-6">
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Reviews from Drivers</h3>
        <ReviewsList reviews={reviews} />
    </div>
  </div>
);

const DriverSpecificProfile: React.FC<{ profile: DriverProfileData, onUpdateProfileData: (field: keyof DriverProfileData, value: any) => void, disabled: boolean, reviews: { review: string; rating: number }[] }> = ({ profile, onUpdateProfileData, disabled, reviews }) => {
  const [truckData, setTruckData] = useState<Partial<Truck>>(profile.truck || { type: TruckType.PICKUP });
  const [selectedFile, setSelectedFile] = useState<Record<string, File | null>>({});

  useEffect(() => {
    setTruckData(profile.truck || { type: TruckType.PICKUP });
  }, [profile.truck]);

  const handleTruckChange = <K extends keyof Truck,>(field: K, value: Truck[K]) => {
    setTruckData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveTruck = () => {
    if (truckData.type && truckData.licensePlate && truckData.make && truckData.model && truckData.year) {
      const fullTruckData: Truck = {
        id: profile.truck?.id || Date.now().toString(),
        ...truckData,
        type: truckData.type!,
        licensePlate: truckData.licensePlate!,
        make: truckData.make!,
        model: truckData.model!,
        year: truckData.year!,
        maxPayloadLbs: TRUCK_SPECS[truckData.type!].maxPayloadLbs,
        maxVolumeCubicFt: TRUCK_SPECS[truckData.type!].maxVolumeCubicFt,
      };
      onUpdateProfileData('truck', fullTruckData);
      alert("Truck details saved (simulated).");
    } else {
      alert("Please fill all truck fields.");
    }
  };

  const handleDocumentUpload = (docId: string, docName: string) => {
    const file = selectedFile[docId];
    if (file) {
      const newDocument: UserDocument = {
        id: docId,
        name: docName,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      };
      const updatedDocs = [...profile.documents.filter(d => d.id !== docId), newDocument];
      onUpdateProfileData('documents', updatedDocs);
      alert(`${docName} uploaded: ${file.name} (simulated).`);
      setSelectedFile(prev => ({...prev, [docId]: null})); // Clear file input
    } else {
      alert("Please select a file to upload.");
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-700 space-y-6">
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Reviews from Shippers</h3>
        <ReviewsList reviews={reviews} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Availability</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" className="form-checkbox h-5 w-5 text-kargo-teal rounded bg-slate-600 border-slate-500 focus:ring-kargo-teal" checked={profile.isAvailable} onChange={e => onUpdateProfileData('isAvailable', e.target.checked)} disabled={disabled}/>
          <span className="text-gray-300">I am currently available for jobs</span>
        </label>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Truck Details</h3>
        <SelectField label="Truck Type" id="truckType" options={TRUCK_TYPES_OPTIONS} value={truckData.type} onChange={e => handleTruckChange('type', e.target.value as TruckType)} disabled={disabled} />
        {truckData.type && <p className="text-xs text-gray-400 -mt-2 mb-2">Payload: {TRUCK_SPECS[truckData.type].maxPayloadLbs} lbs, Volume: {TRUCK_SPECS[truckData.type].maxVolumeCubicFt} cu ft</p>}
        <InputField label="License Plate" id="licensePlate" type="text" value={truckData.licensePlate || ''} onChange={e => handleTruckChange('licensePlate', e.target.value)} disabled={disabled} />
        <InputField label="Make" id="make" type="text" value={truckData.make || ''} onChange={e => handleTruckChange('make', e.target.value)} disabled={disabled} />
        <InputField label="Model" id="model" type="text" value={truckData.model || ''} onChange={e => handleTruckChange('model', e.target.value)} disabled={disabled} />
        <InputField label="Year" id="year" type="text" value={truckData.year || ''} onChange={e => handleTruckChange('year', e.target.value)} disabled={disabled} />
        <Button onClick={handleSaveTruck} className="mt-2 text-sm py-1 px-2" variant="secondary" disabled={disabled}>Save Truck Details</Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Documents (UI Only)</h3>
        {REQUIRED_DOCUMENTS.map(doc => {
          const existingDoc = profile.documents.find(d => d.id === doc.id);
          return (
            <div key={doc.id} className="mb-3 p-3 bg-slate-700 rounded">
              <p className="text-gray-300 font-medium">{doc.name}</p>
              {existingDoc ? <p className="text-sm text-green-400">Uploaded: {existingDoc.fileName}</p> : <p className="text-sm text-yellow-400">Not uploaded yet.</p>}
              <InputField label={`Upload ${doc.name}`} id={`doc-${doc.id}`} type="file" onChange={e => setSelectedFile(prev => ({...prev, [doc.id]: e.target.files ? e.target.files[0] : null}))} className="mt-1 text-xs" disabled={disabled} />
              <Button onClick={() => handleDocumentUpload(doc.id, doc.name)} className="mt-1 text-xs py-1 px-2" variant="secondary" disabled={disabled || !selectedFile[doc.id]}>Upload</Button>
            </div>
          );
        })}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-kargo-teal mb-3">Payout Information (UI Only)</h3>
        <InputField label="Bank Account Number (Last 4)" id="accountNumber" type="text" placeholder="XXXX" value={profile.payoutDetails.accountNumberLast4 || ''} onChange={e => onUpdateProfileData('payoutDetails', {...profile.payoutDetails, accountNumberLast4: e.target.value})} disabled={disabled} />
        <InputField label="Routing Number (Last 4)" id="routingNumber" type="text" placeholder="XXXX" value={profile.payoutDetails.routingNumberLast4 || ''} onChange={e => onUpdateProfileData('payoutDetails', {...profile.payoutDetails, routingNumberLast4: e.target.value})} disabled={disabled} />
      </div>
    </div>
  );
};


const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, isLoading: authLoading } = useAuth();
  const { jobs } = useJobs();
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditableUser(JSON.parse(JSON.stringify(currentUser))); // Deep copy
    }
  }, [currentUser]);

  const { averageRating, ratingCount, reviews } = useMemo(() => {
    if (!currentUser) return { averageRating: null, ratingCount: 0, reviews: [] };

    const relevantJobs = jobs.filter(job => 
        job.status === JobStatus.COMPLETED && 
        ((currentUser.role === UserRole.DRIVER && job.driverId === currentUser.id && job.driverRating !== null) ||
         (currentUser.role === UserRole.SHIPPER && job.shipperId === currentUser.id && job.shipperRating !== null))
    );

    const ratings = relevantJobs.map(job => 
        currentUser.role === UserRole.DRIVER ? job.driverRating! : job.shipperRating!
    );

    const receivedReviews = jobs
      .filter(job => 
        job.status === JobStatus.COMPLETED &&
        ((currentUser.role === UserRole.DRIVER && job.driverId === currentUser.id && job.driverReview) || 
         (currentUser.role === UserRole.SHIPPER && job.shipperId === currentUser.id && job.shipperReview))
      )
      .map(job => ({
          review: (currentUser.role === UserRole.DRIVER ? job.driverReview : job.shipperReview)!,
          rating: (currentUser.role === UserRole.DRIVER ? job.driverRating : job.shipperRating)!,
      }))
      .reverse();


    if (ratings.length === 0) return { averageRating: null, ratingCount: 0, reviews: receivedReviews };
    
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return { averageRating: avg, ratingCount: ratings.length, reviews: receivedReviews };

  }, [jobs, currentUser]);

  const handleInputChange = (field: keyof User, value: any) => {
    if (editableUser) {
      setEditableUser({ ...editableUser, [field]: value });
    }
  };

  const handleProfileDataChange = (field: keyof (ShipperProfileData | DriverProfileData), value: any) => {
    if (editableUser) {
      setEditableUser({
        ...editableUser,
        profileData: {
          ...editableUser.profileData,
          [field]: value,
        },
      });
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!editableUser) return;

    try {
      await updateUserProfile(editableUser);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    }
  };

  if (authLoading && !currentUser) return <PageWrapper title="Loading Profile..."><p>Loading user data...</p></PageWrapper>;
  if (!currentUser || !editableUser) return <PageWrapper title="Error"><p>User not found. Please log in.</p></PageWrapper>;

  return (
    <PageWrapper title="My Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)}/>}

        <GeneralProfileInfo user={editableUser} onUpdate={handleInputChange} disabled={!isEditing || authLoading} averageRating={averageRating} ratingCount={ratingCount} />

        {editableUser.role === UserRole.SHIPPER && (
          <ShipperSpecificProfile profile={editableUser.profileData as ShipperProfileData} onUpdate={handleProfileDataChange} disabled={!isEditing || authLoading} reviews={reviews} />
        )}
        {editableUser.role === UserRole.DRIVER && (
          <DriverSpecificProfile profile={editableUser.profileData as DriverProfileData} onUpdateProfileData={handleProfileDataChange} disabled={!isEditing || authLoading} reviews={reviews} />
        )}
        
        <div className="flex space-x-4 mt-6 pt-6 border-t border-slate-700">
          {isEditing ? (
            <>
              <Button type="submit" isLoading={authLoading} disabled={authLoading}>Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => { setIsEditing(false); setEditableUser(JSON.parse(JSON.stringify(currentUser))); setError(null); setSuccess(null); }} disabled={authLoading}>Cancel</Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)} disabled={authLoading}>Edit Profile</Button>
          )}
        </div>
      </form>
    </PageWrapper>
  );
};

export default ProfilePage;