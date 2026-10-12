import React from 'react';
import { Navigate } from 'react-router-dom';

export const ServiceDetail: React.FC = () => {
  return <Navigate to="/freelancers" replace />;
};

export default ServiceDetail;
