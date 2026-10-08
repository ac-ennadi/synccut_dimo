'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </AuthProvider>
  );
};
