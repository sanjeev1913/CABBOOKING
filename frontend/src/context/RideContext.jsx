import { createContext, useContext, useState, useCallback } from 'react';

const RideContext = createContext(null);

export const RideProvider = ({ children }) => {
    const [currentRide, setCurrentRide] = useState(null);
    const [rideStatus, setRideStatus] = useState(null);
    const [acceptedDriver, setAcceptedDriver] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);

    const updateRide = useCallback((ride) => {
        setCurrentRide(ride);
        if (ride?.status) setRideStatus(ride.status);
    }, []);

    const updateStatus = useCallback((status) => {
        setRideStatus(status);
        if (currentRide) {
            setCurrentRide(prev => ({ ...prev, status }));
        }
    }, [currentRide]);

    const setDriver = useCallback((driver) => {
        setAcceptedDriver(driver);
    }, []);

    const updateDriverLocation = useCallback((lat, lng) => {
        setDriverLocation({ lat, lng });
    }, []);

    const clearRide = useCallback(() => {
        setCurrentRide(null);
        setRideStatus(null);
        setAcceptedDriver(null);
        setDriverLocation(null);
    }, []);

    return (
        <RideContext.Provider value={{
            currentRide,
            rideStatus,
            acceptedDriver,
            driverLocation,
            updateRide,
            updateStatus,
            setDriver,
            updateDriverLocation,
            clearRide,
        }}>
            {children}
        </RideContext.Provider>
    );
};

export const useRide = () => {
    const context = useContext(RideContext);
    if (!context) throw new Error('useRide must be used within RideProvider');
    return context;
};

export default RideContext;
