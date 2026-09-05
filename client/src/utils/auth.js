const USERS_KEY = 'candidateiq_users';
const CURRENT_USER_KEY = 'candidateiq_current_user';
const SESSION_KEY = 'candidateiq_session';

// Predefined demo accounts
const DEFAULT_USERS = [
  {
    id: 'cand_demo_001',
    name: 'Alex Johnson',
    email: 'candidate.demo@candidateiq.com',
    password: 'password123',
    role: 'candidate',
    createdAt: '2026-01-01'
  },
  {
    id: 'rec_demo_001',
    name: 'Sarah Wilson',
    email: 'recruiter.demo@candidateiq.com',
    password: 'password123',
    role: 'hr',
    paymentStatus: 'paid',
    activated: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'admin_001',
    name: 'CandidateIQ System Admin',
    email: 'admin@candidateiq.com',
    password: 'Admin@123',
    role: 'admin',
    createdAt: '2025-01-01'
  }
];

export const initAuthStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
};

export const getUsers = () => {
  initAuthStorage();
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || DEFAULT_USERS;
  } catch (e) {
    return DEFAULT_USERS;
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!foundUser) {
    return { success: false, message: 'Invalid email or password.' };
  }

  if (foundUser.password !== password) {
    return { success: false, message: 'Invalid email or password.' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
  localStorage.setItem(SESSION_KEY, `session_${Date.now()}`);
  return { success: true, user: foundUser };
};

export const registerUser = ({ name, email, password, role }) => {
  const users = getUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (existing) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: role || 'candidate',
    paymentStatus: role === 'hr' ? 'pending' : 'paid',
    activated: role !== 'hr',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  localStorage.setItem(SESSION_KEY, `session_${Date.now()}`);

  return { success: true, user: newUser };
};

export const activateHrPayment = (userId) => {
  const users = getUsers();
  let updatedUser = null;

  const updatedUsers = users.map((u) => {
    if (u.id === userId || u.email === userId) {
      updatedUser = { ...u, paymentStatus: 'paid', activated: true };
      return updatedUser;
    }
    return u;
  });

  if (updatedUser) {
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }

  return updatedUser;
};

export const updateUser = (updatedFields) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getUsers();
  const updatedUser = { ...currentUser, ...updatedFields };

  const newUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));

  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

  return updatedUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
};
