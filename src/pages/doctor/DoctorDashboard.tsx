import React from 'react';
import { DoctorPortalLayout } from './DoctorPortalLayout';

interface Props {
  userProfile?: any;
  onLogout?: () => void;
}

export const DoctorDashboard: React.FC<Props> = ({ userProfile, onLogout }) => {
  return (
    <DoctorPortalLayout 
      userProfile={userProfile || null} 
      onLogout={onLogout || (() => {})} 
    />
  );
};

export default DoctorDashboard;
