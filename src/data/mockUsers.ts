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

export const loginUser = (email: string, _password: string): User | null => {
  // Mock login - in real app, this would validate credentials
  // Password is intentionally not validated in mock implementation
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

export const createUser = (email: string, name: string, _password: string): User => {
  // Password is intentionally not stored/validated in mock implementation
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

export const saveContract = (contractId: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (!user.savedContracts.includes(contractId)) {
    user.savedContracts.push(contractId);
    return true;
  }
  return false;
};

export const removeSavedContract = (contractId: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const index = user.savedContracts.indexOf(contractId);
  if (index > -1) {
    user.savedContracts.splice(index, 1);
    return true;
  }
  return false;
};

export const isContractSaved = (contractId: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.savedContracts.includes(contractId);
};

export const incrementSearchCount = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Pro users have unlimited searches
  if (user.subscriptionTier === 'pro') {
    user.searchCount += 1;
    return true;
  }
  
  // Free users have a limit of 10 searches per month
  if (user.subscriptionTier === 'free' && user.searchCount < 10) {
    user.searchCount += 1;
    return true;
  }
  
  return false; // Free user has reached their limit
};

export const canPerformSearch = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Pro users can always search
  if (user.subscriptionTier === 'pro') return true;
  
  // Free users can search if under limit
  return user.subscriptionTier === 'free' && user.searchCount < 10;
};

export const getSearchLimitInfo = (): { canSearch: boolean; remaining: number; limit: number } => {
  const user = getCurrentUser();
  if (!user) {
    return { canSearch: false, remaining: 0, limit: 0 };
  }
  
  if (user.subscriptionTier === 'pro') {
    return { canSearch: true, remaining: -1, limit: -1 }; // -1 means unlimited
  }
  
  const limit = 10;
  const remaining = Math.max(0, limit - user.searchCount);
  const canSearch = user.searchCount < limit;
  
  return { canSearch, remaining, limit };
};
