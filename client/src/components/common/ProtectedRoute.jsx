import React from 'react';
import { getCurrentUser, isAuthenticated } from '../../utils/auth';

function ProtectedRoute({ allowedRoles, currentTab, children, onRedirect, onRequirePayment }) {
  const user = getCurrentUser();

  if (!isAuthenticated() || !user) {
    if (onRedirect) onRedirect('landing');
    return null;
  }

  // Check HR payment status requirement
  if (user.role === 'hr' && user.paymentStatus === 'pending') {
    if (onRequirePayment) onRequirePayment(user);
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to legitimate workspace based on role
    if (user.role === 'candidate') {
      if (onRedirect) onRedirect('dashboard');
    } else if (user.role === 'hr') {
      if (onRedirect) onRedirect('recruiter-dashboard');
    } else if (user.role === 'admin') {
      if (onRedirect) onRedirect('admin-dashboard');
    }
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
