import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

/*
Hook to handle user login and registration.
Submits user data to the API and handles authentication.
On successful login or registration, fetches user stations and redirects to the dashboard,
otherwise returns error messages for displaying to the user.
*/
export default function useLoginRegister(fetchUserStations) {
    const navigate = useNavigate();
    const location = useLocation();
    const [generalError, setGeneralError] = useState(null);

    const loginOrRegister = async (values, isRegister, setSubmitting, setErrors) => {
        setGeneralError(null);
        setErrors({});
        
        try {
          // Determine the endpoint based on whether it's a registration or login
          const endpoint = isRegister ? `${import.meta.env.VITE_API_USERS_URL}/register` : `${import.meta.env.VITE_API_USERS_URL}/login`;
          const response = await axios.post(endpoint, values);

          if (response.status === 200 && response.data.result) {
            // set users jwt token
            const token = response.data.result.jwt;
            localStorage.setItem('jwt', token);

            // fetch users station list and redirect to last visited page or dashboard
            await fetchUserStations();
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo, { replace: true });
          }
          } catch (error) {

              // Parsing API response errors for display incase of Formik failure
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