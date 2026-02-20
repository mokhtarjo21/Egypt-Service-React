import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useAuth = () => {
    const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
    return { user, isAuthenticated, isLoading };
};
