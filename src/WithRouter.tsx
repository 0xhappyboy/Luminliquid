// utils/withRouter.tsx
import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function withRouter<T>(Component: React.ComponentType<T & any>) {
  return function WrappedComponent(props: T) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    
    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
      />
    );
  };
}