import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Hook to handle user login/register and fetch users stations
export default function useLoginRegister(fetchUserStations) {
    const navigate = useNavigate();
    const location = useLocation();
    const [generalError, setGeneralError] = useState(null);

    async function loginOrRegister(values, isRegister, setSubmitting, setErrors) {
        setGeneralError(null);
        try {
          const endpoint = isRegister ? `${import.meta.env.VITE_API_USER_URL}/register` : `${import.meta.env.VITE_API_USER_URL}/login`;
          const response = await axios.post(endpoint, values);

          if (response.status === 200 && response.data.result) {
            const token = response.data.result.jwt;
            localStorage.setItem('jwt', token);

            await fetchUserStations();
            
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo, { replace: true });
          }
          } catch (error) {
              if (error.response?.data?.errors) {
                  const apiErrors = error.response.data.errors.reduce((acc, curr) => {
                    acc[curr.path] = curr.msg;
                    return acc;
                  }, {});
                  setErrors(apiErrors);
              } else if (error.response?.data?.message) {
                  setGeneralError(error.response.data.message);
              } else {
                  setGeneralError('An unexpected error occurred.');
              }
          }
          setSubmitting(false);
        };

    return { loginOrRegister, generalError, setGeneralError };
}