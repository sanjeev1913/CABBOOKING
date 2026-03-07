import API from './api';

export const requestRide = (data) => API.post('/rides/request', data);
export const estimateFare = (data) => API.post('/rides/estimate', data);
export const acceptRide = (rideId) => API.post('/rides/accept', { rideId });
export const startRide = (rideId) => API.post('/rides/start', { rideId });
export const completeRide = (rideId) => API.post('/rides/complete', { rideId });
export const getRideHistory = (page = 1) => API.get(`/rides/history?page=${page}&limit=10`);
export const getCurrentRide = () => API.get('/rides/current');
