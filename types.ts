export enum UserRole {
  SHIPPER = 'SHIPPER',
  DRIVER = 'DRIVER',
}

export enum TruckType {
  PICKUP = 'Pickup Truck',
  CARGO_VAN = 'Cargo Van',
  SMALL_BOX_TRUCK = 'Small Box Truck (10ft)',
}

export enum JobStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  INPROGRESS_TO_PICKUP = 'En Route to Pickup',
  INPROGRESS_TO_DROPOFF = 'En Route to Dropoff',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}


export interface UserDocument {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string; 
}

export interface Truck {
  id: string;
  type: TruckType;
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  maxPayloadLbs?: number; // Predefined based on type
  maxVolumeCubicFt?: number; // Predefined based on type
}

export interface PaymentMethod {
  id: string;
  type: string; // e.g., 'Visa'
  last4: string;
  expiry: string; // MM/YY
}

export interface Job {
  id: string;
  shipperId: string;
  driverId: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  goodsDescription: string;
  goodsPhotos: string[]; // Array of base64 encoded images
  truckTypeRequested: TruckType;
  status: JobStatus;
  estimatedPrice: number;
  estimatedDistance: number;
  finalFare: number | null;
  commission: number | null;
  createdAt: string; // ISO 8601 date string
  acceptedAt: string | null;
  startedTripAt: string | null;
  completedAt: string | null;
  // Rating fields
  shipperRating: number | null;
  shipperReview: string | null;
  driverRating: number | null;
  driverReview: string | null;
}

export interface Earning {
  id: string;
  jobId: string;
  amount: number;
  date: string;
}

export interface ShipperProfileData {
  paymentMethods: PaymentMethod[];
  averageRating?: number;
}

export interface DriverProfileData {
  documents: UserDocument[];
  truck?: Truck;
  isAvailable: boolean;
  payoutDetails: {
    accountNumberLast4?: string;
    routingNumberLast4?: string;
  };
  earningsHistory: Earning[];
  averageRating?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileData: ShipperProfileData | DriverProfileData;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedUser: User) => Promise<void>;
}

export interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  createJob: (jobData: Omit<Job, 'id' | 'shipperId' | 'driverId' | 'status' | 'finalFare' | 'commission' | 'createdAt' | 'acceptedAt' | 'startedTripAt' | 'completedAt' | 'shipperRating' | 'shipperReview' | 'driverRating' | 'driverReview'>) => Promise<Job>;
  getJobById: (id: string) => Job | undefined;
  getJobsForShipper: (shipperId: string) => Job[];
  getAvailableJobsForDriver: (driver: User) => Job[];
  acceptJob: (jobId: string, driverId: string) => Promise<void>;
  updateJobStatus: (jobId: string, newStatus: JobStatus) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  submitRating: (jobId: string, rating: number, review: string, ratedBy: UserRole) => Promise<void>;
}

export interface Notification {
    id: number;
    message: string;
    type: 'info' | 'success' | 'error';
    link?: string;
}

export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type: 'info' | 'success' | 'error', link?: string) => void;
    removeNotification: (id: number) => void;
}