import { createBrowserRouter } from 'react-router';

// Pages
import AboutPage from './pages/AboutPage';
import LandingPage from './pages/LandingPage';
import CustomerRegister from './pages/CustomerRegister';
import ProviderRegister from './pages/ProviderRegister';
import OTPVerification from './pages/OTPVerification';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProfile from './pages/customer/Profile';
import BrowseServices from './pages/customer/BrowseServices';
import SubscriptionSelection from './pages/customer/SubscriptionSelection';
import Payment from './pages/customer/Payment';
import InstantBooking from './pages/customer/InstantBooking';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderProfile from './pages/provider/Profile';
import ServiceRequests from './pages/provider/ServiceRequests';
import ServiceManagement from './pages/provider/ServiceManagement';
import Earnings from './pages/provider/Earnings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AboutPage
  },
  {
    path: '/home',
    Component: LandingPage
  },
  {
    path: '/register/customer',
    Component: CustomerRegister
  },
  {
    path: '/register/provider',
    Component: ProviderRegister
  },
  {
    path: '/verify-otp',
    Component: OTPVerification
  },
  {
    path: '/login',
    Component: Login
  },
  // Customer Routes
  {
    path: '/customer/dashboard',
    Component: CustomerDashboard
  },
  {
    path: '/customer/profile',
    Component: CustomerProfile
  },
  {
    path: '/customer/browse-services',
    Component: BrowseServices
  },
  {
    path: '/customer/service/:serviceId',
    Component: SubscriptionSelection
  },
  {
    path: '/customer/payment',
    Component: Payment
  },
  {
    path: '/customer/instant-booking',
    Component: InstantBooking
  },
  // Provider Routes
  {
    path: '/provider/dashboard',
    Component: ProviderDashboard
  },
  {
    path: '/provider/profile',
    Component: ProviderProfile
  },
  {
    path: '/provider/service-requests',
    Component: ServiceRequests
  },
  {
    path: '/provider/service-management',
    Component: ServiceManagement
  },
  {
    path: '/provider/earnings',
    Component: Earnings
  },
  // 404
  {
    path: '*',
    Component: NotFound
  }
]);
