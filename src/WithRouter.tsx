import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function withRouter<P extends object>(
  WrappedComponent: React.ComponentType<P & {
    navigate: (to: string, options?: any) => void;
    location?: ReturnType<typeof useLocation>;
    params?: ReturnType<typeof useParams>;
  }>
) {
  return function WithRouterWrapper(props: P) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    return (
      <WrappedComponent
        {...props}
        navigate={navigate}
        location={location}
        params={params}
      />
    );
  };
}