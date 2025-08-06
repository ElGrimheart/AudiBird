import React from 'react';
import { Formik } from 'formik';
import UserForm from '../common/UserForm';
import { loginRegisterSchema } from '../../utils/formValidator';

/* 
LoginRegisterForm component to handle user login and registration.
Displayed fields on whether login or registration is selected.
Wrapped in Formik for validation, submission handling and error reporting.
*/
export default function LoginRegisterForm({ isRegister, onSubmit, generalError, setIsRegister }) {
    return (
        <>  
            {/* Display for general errors */}
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
                    confirmPassword: '',
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
                                ? [{
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
                                ] : []),
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
                                ? [{
                                    label: 'Confirm Password',
                                    type: 'password',
                                    name: 'confirmPassword',
                                    value: values.confirmPassword,
                                    onChange: handleChange,
                                    onBlur: () => setFieldTouched('confirmPassword', true),
                                    placeholder: 'Confirm Password',
                                    error: touched.confirmPassword && errors.confirmPassword,
                                },
                            ] : []),
                        ]}
                        onSubmit={handleSubmit}
                        submitText={isRegister ? 'Register' : 'Login'}
                        secondaryText={isRegister ? 'Already have an account? Login' : 'New User? Register here'}
                        onSecondary={() => setIsRegister((prev) => !prev)} 
                        isSubmitting={isSubmitting}
                    />
                )}
            </Formik>
        </>
    );
}