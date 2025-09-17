import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    subscriptionTier: 'free',
    searchCount: 3,
    savedContracts: ['1', '4', '7'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'pro@example.com',
    name: 'Pro User',
    subscriptionTier: 'pro',
    searchCount: 25,
    savedContracts: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    createdAt: new Date('2024-01-15'),
  },
];

// Mock authentication state
export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;

export const loginUser = (email: string, password: string): User | null => {
  // Mock login - in real app, this would validate credentials
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  setCurrentUser(null);
};

export const createUser = (email: string, name: string, password: string): User => {
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    email,
    name,
    subscriptionTier: 'free',
    searchCount: 0,
    savedContracts: [],
    createdAt: new Date(),
  };
  mockUsers.push(newUser);
  setCurrentUser(newUser);
  return newUser;
};
