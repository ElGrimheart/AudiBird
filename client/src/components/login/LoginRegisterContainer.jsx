import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoginRegisterForm from './LoginRegisterForm';
import UserStationsContext from '../../contexts/UserStationsContext';

const LoginRegisterContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const { fetchUserStations } = useContext(UserStationsContext);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setGeneralError(null);
    try {
      const endpoint = isRegister
        ? `${import.meta.env.VITE_API_USER_URL}/register`
        : `${import.meta.env.VITE_API_USER_URL}/login`;

      const response = await axios.post(endpoint, values);

      if (response.data && response.data.result) {
        const token = response.data.result.userToken;
        localStorage.setItem('jwt', token);

        try {
          fetchUserStations(token); // Pass the token to fetchUserStations
        } catch (error) {
          console.error("Error fetching user stations:", error);
        }
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

  return (
    <LoginRegisterForm
      isRegister={isRegister}
      onSubmit={handleSubmit}
      generalError={generalError}
      setIsRegister={setIsRegister} // Pass setIsRegister to LoginRegisterForm
    />
  );
};

export default LoginRegisterContainer;