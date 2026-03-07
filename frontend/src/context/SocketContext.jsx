import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token, user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socketRef.current.on('connect', () => {
            setConnected(true);
            console.log('Socket connected:', socketRef.current.id);

            // Join appropriate room
            if (user?.role === 'RIDER') {
                socketRef.current.emit('join:rider', user._id);
            }
        });

        socketRef.current.on('disconnect', () => {
            setConnected(false);
            console.log('Socket disconnected');
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connect error:', err.message);
        });

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [isAuthenticated, token, user]);

    const joinDriverRoom = (driverId) => {
        socketRef.current?.emit('join:driver', driverId);
    };

    const emit = (event, data) => {
        socketRef.current?.emit(event, data);
    };

    const on = (event, callback) => {
        socketRef.current?.on(event, callback);
        return () => socketRef.current?.off(event, callback);
    };

    const off = (event, callback) => {
        socketRef.current?.off(event, callback);
    };

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected, joinDriverRoom, emit, on, off }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within SocketProvider');
    return context;
};

export default SocketContext;
