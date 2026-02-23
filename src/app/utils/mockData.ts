// Mock data and localStorage utilities

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'customer' | 'provider';
  address?: string;
  serviceType?: string;
  serviceArea?: string;
  status?: 'active' | 'pending';
  rating?: number;
  completedJobs?: number;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  image: string;
  customerReviews?: Array<{
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export interface Subscription {
  id: string;
  customerId: string;
  serviceId: string;
  providerId: string;
  plan: 'daily' | 'weekly' | 'monthly';
  price: number;
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  serviceName: string;
  providerName: string;
}

export interface InstantBooking {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  description: string;
  image?: string;
  voiceNote?: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  createdAt: string;
  providerId?: string;
  providerName?: string;
  price?: number;
  quote?: number;
  feedback?: 'thumbs_up' | 'thumbs_down' | null;
  feedbackMessage?: string;
}

export interface Payment {
  id: string;
  userId: string;
  providerId: string;
  amount: number;
  type: 'subscription' | 'instant';
  status: 'success' | 'failed' | 'pending';
  date: string;
  subscriptionId?: string;
  bookingId?: string;
}

// Initialize mock data
export const initializeMockData = () => {
  if (!localStorage.getItem('users')) {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@customer.com',
        mobile: '1234567890',
        role: 'customer',
        address: '123 Main St, New York'
      },
      {
        id: '2',
        name: 'Mike Smith',
        email: 'mike@provider.com',
        mobile: '9876543210',
        role: 'provider',
        serviceType: 'Plumber',
        serviceArea: 'New York',
        status: 'active',
        rating: 4.8,
        completedJobs: 156
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah@provider.com',
        mobile: '5551234567',
        role: 'provider',
        serviceType: 'Electrician',
        serviceArea: 'Brooklyn',
        status: 'active',
        rating: 4.9,
        completedJobs: 203
      },
      {
        id: '4',
        name: 'Robert Brown',
        email: 'robert@provider.com',
        mobile: '5559876543',
        role: 'provider',
        serviceType: 'Carpenter',
        serviceArea: 'Manhattan',
        status: 'active',
        rating: 4.7,
        completedJobs: 89
      }
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }

  // Always regenerate services to ensure we have 15 services × 17 providers = 255 services
  const mockServices = generateMockServices();
  localStorage.setItem('services', JSON.stringify(mockServices));

  if (!localStorage.getItem('subscriptions')) {
    localStorage.setItem('subscriptions', JSON.stringify([]));
  }

  if (!localStorage.getItem('instantBookings')) {
    localStorage.setItem('instantBookings', JSON.stringify([]));
  }

  if (!localStorage.getItem('payments')) {
    localStorage.setItem('payments', JSON.stringify([]));
  }
};

// User management
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

export const updateUser = (userId: string, updates: Partial<User>) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// Service management
export const getServices = (): Service[] => {
  return JSON.parse(localStorage.getItem('services') || '[]');
};

export const getServiceById = (id: string): Service | null => {
  const services = getServices();
  return services.find(s => s.id === id) || null;
};

export const getServicesByProvider = (providerId: string): Service[] => {
  const services = getServices();
  return services.filter(s => s.providerId === providerId);
};

// Subscription management
export const getSubscriptions = (): Subscription[] => {
  return JSON.parse(localStorage.getItem('subscriptions') || '[]');
};

export const addSubscription = (subscription: Subscription) => {
  const subscriptions = getSubscriptions();
  subscriptions.push(subscription);
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
};

export const getCustomerSubscriptions = (customerId: string): Subscription[] => {
  const subscriptions = getSubscriptions();
  return subscriptions.filter(s => s.customerId === customerId);
};

export const getProviderSubscriptions = (providerId: string): Subscription[] => {
  const subscriptions = getSubscriptions();
  return subscriptions.filter(s => s.providerId === providerId);
};

export const updateSubscription = (id: string, updates: Partial<Subscription>) => {
  const subscriptions = getSubscriptions();
  const index = subscriptions.findIndex(s => s.id === id);
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...updates };
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }
};

// Instant booking management
export const getInstantBookings = (): InstantBooking[] => {
  return JSON.parse(localStorage.getItem('instantBookings') || '[]');
};

export const addInstantBooking = (booking: InstantBooking) => {
  const bookings = getInstantBookings();
  bookings.push(booking);
  localStorage.setItem('instantBookings', JSON.stringify(bookings));
};

export const getCustomerBookings = (customerId: string): InstantBooking[] => {
  const bookings = getInstantBookings();
  return bookings.filter(b => b.customerId === customerId);
};

export const getProviderBookings = (providerId: string): InstantBooking[] => {
  const bookings = getInstantBookings();
  return bookings.filter(b => b.providerId === providerId || b.status === 'pending');
};

export const updateBooking = (id: string, updates: Partial<InstantBooking>) => {
  const bookings = getInstantBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    localStorage.setItem('instantBookings', JSON.stringify(bookings));
  }
};

// Payment management
export const addPayment = (payment: Payment) => {
  const payments = JSON.parse(localStorage.getItem('payments') || '[]');
  payments.push(payment);
  localStorage.setItem('payments', JSON.stringify(payments));
};

export const getPayments = (): Payment[] => {
  return JSON.parse(localStorage.getItem('payments') || '[]');
};

export const getUserPayments = (userId: string): Payment[] => {
  const payments = getPayments();
  return payments.filter(p => p.userId === userId);
};

export const getProviderPayments = (providerId: string): Payment[] => {
  const payments = getPayments();
  return payments.filter(p => p.providerId === providerId);
};

export const getProviderServices = (providerId: string): Service[] => {
  const services = getServices();
  return services.filter(s => s.providerId === providerId);
};

// Service types
export const SERVICE_TYPES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'HVAC Technician',
  'Painter',
  'Cleaner',
  'Gardener',
  'Mechanic',
  'Appliance Repair',
  'Pest Control',
  'Home Security',
  'Interior Designer',
  'Landscaping',
  'Pool Maintenance',
  'Window Cleaning'
];

// Helper function to generate mock services
const generateMockServices = (): Service[] => {
  const services: Service[] = [];
  const locations = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Tuticorin', 'Tirunelveli', 'Dindigul', 'Thanjavur', 'Nagercoil', 'Kanchipuram', 'Karur', 'Cuddalore', 'Pollachi', 'Hosur', 'Neyveli', 'Chengalpattu'];
  
  const firstNames = ['John', 'Mike', 'Sarah', 'Robert', 'Emily', 'David', 'Jennifer', 'Michael', 'Lisa', 'James', 'Amanda', 'Christopher', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Stephanie', 'Andrew', 'Nicole', 'Joshua'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
  
  const serviceDescriptions: { [key: string]: string } = {
    'Plumber': 'Professional plumbing services including repairs, installations, and maintenance for residential and commercial properties.',
    'Electrician': 'Licensed electrician for home and commercial electrical work, installations, repairs, and safety inspections.',
    'Carpenter': 'Expert carpentry services for furniture, cabinets, custom woodwork, and home improvements.',
    'HVAC Technician': 'Heating and cooling system installation, repair, maintenance, and air quality services.',
    'Painter': 'Professional interior and exterior painting services for residential and commercial properties.',
    'Cleaner': 'Professional cleaning services for homes and offices, including deep cleaning and regular maintenance.',
    'Gardener': 'Professional landscaping and garden maintenance services including lawn care and planting.',
    'Mechanic': 'Certified auto mechanic services for all vehicle makes and models, repairs and maintenance.',
    'Appliance Repair': 'Professional appliance repair services for all major home appliances.',
    'Pest Control': 'Effective pest control services for residential and commercial properties, including termites, rodents, and insects.',
    'Home Security': 'Home security system installation, monitoring, and smart home integration services.',
    'Interior Designer': 'Professional interior design services for residential and commercial spaces, renovations and styling.',
    'Landscaping': 'Complete landscaping services including design, installation, and maintenance.',
    'Pool Maintenance': 'Professional pool cleaning, maintenance, and repair services.',
    'Window Cleaning': 'Professional window cleaning services for residential and commercial buildings.'
  };
  
  const serviceImages: { [key: string]: string } = {
    'Plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
    'Electrician': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
    'Carpenter': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
    'HVAC Technician': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    'Painter': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
    'Cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    'Gardener': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    'Mechanic': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
    'Appliance Repair': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
    'Pest Control': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800',
    'Home Security': 'https://images.unsplash.com/photo-1558002038-1091a166111c?w=800',
    'Interior Designer': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
    'Landscaping': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800',
    'Pool Maintenance': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
    'Window Cleaning': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'
  };

  let serviceId = 1;
  let providerId = 1;

  // Generate services for each service type
  for (const serviceType of SERVICE_TYPES) {
    // Create 17 providers for each service type (15 types * 17 = 255 services, close to 250)
    for (let i = 0; i < 17; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const providerName = `${firstName} ${lastName}`;
      const location = locations[Math.floor(Math.random() * locations.length)];
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const reviews = Math.floor(Math.random() * 200) + 10;
      const basePrice = 100 + Math.floor(Math.random() * 50);
      
      // Generate mock customer reviews
      const customerNames = ['Priya', 'Kumar', 'Lakshmi', 'Rajesh', 'Meena', 'Suresh', 'Divya', 'Arun', 'Swathi', 'Vijay'];
      const reviewComments: { [key: string]: string[] } = {
        'Plumber': ['Excellent service! Fixed the leak quickly.', 'Very professional and timely.', 'Great experience, highly recommended!', 'Knowledgeable and efficient.'],
        'Electrician': ['Fixed all electrical issues promptly.', 'Very knowledgeable and professional.', 'Great work, will hire again.', 'Safety first approach appreciated.'],
        'Carpenter': ['Beautiful furniture craftsmanship.', 'Attention to detail was amazing.', 'Completed work on time and within budget.', 'Highly skilled craftsmanship.'],
        'HVAC Technician': ['Cooling system works perfectly now.', 'Professional and thorough service.', 'Great maintenance work.', 'Recommend for HVAC needs.'],
        'Painter': ['Wall painting was flawless.', 'Clean and efficient work.', 'Great color suggestions.', 'Professional finishing.'],
        'Cleaner': ['Home is sparkling clean!', 'Very thorough and detailed.', 'Reliable and punctual service.', 'Excellent deep cleaning.'],
        'Gardener': ['Garden looks beautiful now.', 'Great landscaping advice.', 'Maintained garden very well.', 'Professional approach.'],
        'Mechanic': ['Car runs smoothly now.', 'Honest and reliable service.', 'Fair pricing for repairs.', 'Knowledgeable mechanic.'],
        'Appliance Repair': ['Fixed the refrigerator quickly.', 'Professional diagnosis and repair.', 'Appliance works like new.', 'Efficient service.'],
        'Pest Control': ['No more pest issues!', 'Effective treatment.', 'Safe and thorough.', 'Recommend for pest control.'],
        'Home Security': ['Secure home now.', 'Professional installation.', 'Great smart home integration.', 'Reliable security system.'],
        'Interior Designer': ['Beautiful home transformation!', 'Creative and innovative ideas.', 'Great attention to style.', 'Exceeded expectations.'],
        'Landscaping': ['Stunning outdoor space!', 'Professional landscaping.', 'Great design implementation.', 'Quality work.'],
        'Pool Maintenance': ['Pool is crystal clear!', 'Regular maintenance done well.', 'Professional service.', 'Recommend for pool care.'],
        'Window Cleaning': ['Windows are spotless!', 'Thorough and efficient.', 'Great service.', 'Professional work.']
      };
      
      const numReviews = Math.floor(Math.random() * 5) + 3;
      const generatedReviews = [];
      for (let r = 0; r < numReviews; r++) {
        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const comments = reviewComments[serviceType] || ['Great service!', 'Professional work.', 'Highly recommended.'];
        generatedReviews.push({
          customerName: `${customerName}${Math.floor(Math.random() * 100)}`,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: comments[Math.floor(Math.random() * comments.length)],
          date: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/2024`
        });
      }

      services.push({
        id: `s${serviceId}`,
        providerId: `p${providerId}`,
        providerName,
        serviceType,
        description: serviceDescriptions[serviceType] || `Professional ${serviceType} services.`,
        location,
        rating: parseFloat(rating),
        reviews,
        monthlyPrice: basePrice,
        quarterlyPrice: Math.floor(basePrice * 3 * 0.9),
        annualPrice: Math.floor(basePrice * 12 * 0.75),
        image: serviceImages[serviceType] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        customerReviews: generatedReviews
      });
      
      serviceId++;
      providerId++;
    }
  }
  
  return services;
};
