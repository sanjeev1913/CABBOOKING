import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('cab_token');
        const storedUser = localStorage.getItem('cab_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('cab_token', userToken);
        localStorage.setItem('cab_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('cab_token');
        localStorage.removeItem('cab_user');
    };

    const isAuthenticated = !!token && !!user;
    const isRider = user?.role === 'RIDER';
    const isDriver = user?.role === 'DRIVER';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, isRider, isDriver }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
