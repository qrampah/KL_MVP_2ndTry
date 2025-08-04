import { TruckType } from './types';

export const APP_NAME = "Kargoline MVP";

export const ROLES = [
  { value: 'SHIPPER', label: 'Shipper (I need to move goods)' },
  { value: 'DRIVER', label: 'Driver (I own a truck)' },
];

export const TRUCK_TYPES_OPTIONS = [
  { value: TruckType.PICKUP, label: 'Pickup Truck' },
  { value: TruckType.CARGO_VAN, label: 'Cargo Van' },
  { value: TruckType.SMALL_BOX_TRUCK, label: 'Small Box Truck (10ft)' },
];

export const TRUCK_SPECS: Record<TruckType, { maxPayloadLbs: number; maxVolumeCubicFt: number }> = {
  [TruckType.PICKUP]: { maxPayloadLbs: 1500, maxVolumeCubicFt: 50 },
  [TruckType.CARGO_VAN]: { maxPayloadLbs: 3000, maxVolumeCubicFt: 250 },
  [TruckType.SMALL_BOX_TRUCK]: { maxPayloadLbs: 5000, maxVolumeCubicFt: 450 },
};

export const PRICING: Record<TruckType, { baseFare: number; perMileRate: number; perMinuteRate: number; }> = {
    [TruckType.PICKUP]: { baseFare: 25, perMileRate: 1.50, perMinuteRate: 0.25 },
    [TruckType.CARGO_VAN]: { baseFare: 40, perMileRate: 2.00, perMinuteRate: 0.40 },
    [TruckType.SMALL_BOX_TRUCK]: { baseFare: 60, perMileRate: 2.75, perMinuteRate: 0.60 },
};

export const TRUCK_IMAGE_URLS: Record<TruckType, string> = {
  [TruckType.PICKUP]: 'https://picsum.photos/seed/pickuptruck/300/200',
  [TruckType.CARGO_VAN]: 'https://picsum.photos/seed/cargovan/300/200',
  [TruckType.SMALL_BOX_TRUCK]: 'https://picsum.photos/seed/boxtruck/300/200',
};

export const KARGO_COMMISSION_RATE = 0.20; // 20% commission

export const REQUIRED_DOCUMENTS = [
  { id: 'license', name: "Driver's License" },
  { id: 'registration', name: "Vehicle Registration" },
  { id: 'insurance', name: "Proof of Commercial Auto Insurance" },
];