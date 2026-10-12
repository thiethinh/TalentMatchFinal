import React from 'react';
import { Navigate } from 'react-router-dom';

export const Services: React.FC = () => {
  return <Navigate to="/freelancers" replace />;
};

export default Services;
