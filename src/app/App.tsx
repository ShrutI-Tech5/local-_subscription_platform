import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { initializeMockData } from './utils/mockData';

export default function App() {
  useEffect(() => {
    // Initialize mock data on app load
    initializeMockData();
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
