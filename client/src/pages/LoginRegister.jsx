import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import axios from 'axios';
import UserForm from '../components/common/UserForm';
import { getInitialValues, validateAuth } from '../utils/authFormValidator';

const LoginRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setFormErrors({});
    try {
      if (isRegister) {
        const response = await axios.post(`${import.meta.env.VITE_API_USER_URL}/register`, values);
      } else {
        const response = await axios.post(`${import.meta.env.VITE_API_USER_URL}/login`, values);
        if (response.data && response.data.result) {
          localStorage.setItem('jwt', response.data.result.userToken);
          const redirectTo = location.state?.from?.pathname || '/dashboard';
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        setFormErrors({ general: error.response.data.error });
      } else if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      } else {
        setFormErrors({ general: "An unexpected error occurred." });
      }
    }
    setSubmitting(false);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
      <Card className="p-4 shadow" style={{ minWidth: 480 }}>
        <Card.Body>
          <h2 className="mb-4 text-center">{isRegister ? 'Register' : 'Login'}</h2>
          <Formik
            initialValues={getInitialValues(isRegister)}
            validate={values => validateAuth(values, isRegister)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              handleSubmit,
              handleChange,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldTouched
            }) => (
              <UserForm
                fields={[
                  ...(isRegister
                    ? [
                        {
                          label: "Name",
                          type: "text",
                          name: "name",
                          value: values.name,
                          onChange: handleChange,
                          onBlur: () => setFieldTouched('name', true),
                          placeholder: "Enter your name",
                          required: true,
                          error: touched.name && errors.name
                        },
                        {
                          label: "Username",
                          type: "text",
                          name: "username",
                          value: values.username,
                          onChange: handleChange,
                          onBlur: () => setFieldTouched('username', true),
                          placeholder: "Enter username",
                          required: true,
                          error: touched.username && errors.username
                        }
                      ]
                    : []),
                  {
                    label: "Email address",
                    type: "email",
                    name: "email",
                    value: values.email,
                    onChange: handleChange,
                    onBlur: () => setFieldTouched('email', true),
                    placeholder: "Enter email",
                    required: true,
                    error: touched.email && errors.email
                  },
                  {
                    label: "Password",
                    type: "password",
                    name: "password",
                    value: values.password,
                    onChange: handleChange,
                    onBlur: () => setFieldTouched('password', true),
                    placeholder: "Password",
                    required: true,
                    error: touched.password && errors.password
                  },
                  ...(isRegister
                    ? [
                        {
                          label: "Confirm Password",
                          type: "password",
                          name: "confirmPassword",
                          value: values.confirmPassword,
                          onChange: handleChange,
                          onBlur: () => setFieldTouched('confirmPassword', true),
                          placeholder: "Confirm Password",
                          required: true,
                          error: touched.confirmPassword && errors.confirmPassword
                        }
                      ]
                    : [])
                ]}
                onSubmit={handleSubmit}
                submitText={isRegister ? "Register" : "Login"}
                secondaryText={isRegister ? "Already have an account? Login" : "New User? Register here"}
                onSecondary={() => setIsRegister((prev) => !prev)}
                generalError={formErrors.general}
                isSubmitting={isSubmitting}
              />
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginRegister;