import API from './api';

export const toggleDriverStatus = (isOnline, currentLocation) =>
    API.post('/drivers/toggle-status', { isOnline, currentLocation });

export const getDriverProfile = () => API.get('/drivers/profile');

export const getNearbyDrivers = (lat, lng, radius = 10) =>
    API.get(`/drivers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

export const updateLocation = (lat, lng) => API.put('/drivers/location', { lat, lng });
