import type { DataClient } from './types';

function notImplemented(method: string): never {
  throw new Error(
    `apiClient.${method} is not implemented in V1 — see Layer 2 doc (docs/03_Layer_2_Post_Pilot.md)`,
  );
}

export const apiClient: DataClient = {
  getStationsNear: () => notImplemented('getStationsNear'),
  getStation: () => notImplemented('getStation'),
  getCPOs: () => notImplemented('getCPOs'),
  getConnectorStatus: () => notImplemented('getConnectorStatus'),
  subscribeToConnectorStatus: () => notImplemented('subscribeToConnectorStatus'),
  initiateSession: () => notImplemented('initiateSession'),
  startSession: () => notImplemented('startSession'),
  stopSession: () => notImplemented('stopSession'),
  subscribeToSession: () => notImplemented('subscribeToSession'),
  getSessionHistory: () => notImplemented('getSessionHistory'),
  getChargingHistory: () => notImplemented('getChargingHistory'),
  getReviewsForStation: () => notImplemented('getReviewsForStation'),
  getPhotosForStation: () => notImplemented('getPhotosForStation'),
  sendOtp: () => notImplemented('sendOtp'),
  verifyOtp: () => notImplemented('verifyOtp'),
  getCurrentUser: () => notImplemented('getCurrentUser'),
  getVehicles: () => notImplemented('getVehicles'),
  getVehicle: () => notImplemented('getVehicle'),
  planRoute: () => notImplemented('planRoute'),
  getPreGeneratedRoutes: () => notImplemented('getPreGeneratedRoutes'),
};
