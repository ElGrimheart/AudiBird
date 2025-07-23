import React from 'react';
import { Formik } from 'formik';
import UserForm from '../common/UserForm';
import { loginRegisterSchema } from '../../utils/userValueValidator';

const LoginRegisterForm = ({ isRegister, onSubmit, generalError, setIsRegister }) => ( // Add setIsRegister as a prop
  <>
    {generalError && (
      <div className="alert alert-danger mb-3">
        {generalError}
      </div>
    )}
    <Formik
      initialValues={{
        name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
      }}
      validationSchema={loginRegisterSchema(isRegister)}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        values,
        errors,
        touched,
        isSubmitting,
        setFieldTouched,
      }) => (
        <UserForm
          fields={[
            ...(isRegister
              ? [
                  {
                    label: 'Name',
                    type: 'text',
                    name: 'name',
                    value: values.name,
                    onChange: handleChange,
                    onBlur: () => setFieldTouched('name', true),
                    placeholder: 'Enter your name',
                    error: touched.name && errors.name,
                  },
                  {
                    label: 'Username',
                    type: 'text',
                    name: 'username',
                    value: values.username,
                    onChange: handleChange,
                    onBlur: () => setFieldTouched('username', true),
                    placeholder: 'Enter username',
                    error: touched.username && errors.username,
                  },
                ]
              : []),
            {
              label: 'Email address',
              type: 'email',
              name: 'email',
              value: values.email,
              onChange: handleChange,
              onBlur: () => setFieldTouched('email', true),
              placeholder: 'Enter email',
              error: touched.email && errors.email,
            },
            {
              label: 'Password',
              type: 'password',
              name: 'password',
              value: values.password,
              onChange: handleChange,
              onBlur: () => setFieldTouched('password', true),
              placeholder: 'Password',
              error: touched.password && errors.password,
            },
            ...(isRegister
              ? [
                  {
                    label: 'Confirm Password',
                    type: 'password',
                    name: 'confirm_password',
                    value: values.confirm_password,
                    onChange: handleChange,
                    onBlur: () => setFieldTouched('confirm_password', true),
                    placeholder: 'Confirm Password',
                    error: touched.confirm_password && errors.confirm_password,
                  },
                ]
              : []),
          ]}
          onSubmit={handleSubmit}
          submitText={isRegister ? 'Register' : 'Login'}
          secondaryText={isRegister ? 'Already have an account? Login' : 'New User? Register here'}
          onSecondary={() => setIsRegister((prev) => !prev)} // Use setIsRegister here
          isSubmitting={isSubmitting}
        />
      )}
    </Formik>
  </>
);

export default LoginRegisterForm;