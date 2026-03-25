import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/api/user/');
            // The backend returns a list, so we take the first item
            if (response.data && response.data.length > 0) {
                setUser(response.data[0]);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
            // If unauthorized, clear the token
            if (error.response?.status === 401) {
                localStorage.removeItem(ACCESS_TOKEN);
            }
        } finally {
            setLoading(false);
        }
    };

    const clearUser = () => {
        setUser(null);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, fetchUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};