import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = {
  CUSTOMER: 'Customer',
  PARTNER: 'Partner',
  ADMIN: 'Admin',
};

/**
 * RoleProvider: Manages active role context (Customer, Partner, Admin)
 * and active user IDs for demoing without passwords or login sessions.
 */
export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('homeserve_active_role') || ROLES.CUSTOMER;
  });

  const [activeCustomerId, setActiveCustomerId] = useState(() => {
    return Number(localStorage.getItem('homeserve_active_customer_id')) || 1;
  });

  const [activePartnerId, setActivePartnerId] = useState(() => {
    return Number(localStorage.getItem('homeserve_active_partner_id')) || 1;
  });

  useEffect(() => {
    localStorage.setItem('homeserve_active_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('homeserve_active_customer_id', activeCustomerId);
  }, [activeCustomerId]);

  useEffect(() => {
    localStorage.setItem('homeserve_active_partner_id', activePartnerId);
  }, [activePartnerId]);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        ROLES,
        activeCustomerId,
        setActiveCustomerId,
        activePartnerId,
        setActivePartnerId,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
