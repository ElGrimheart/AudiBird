import React from 'react';
import { Formik } from 'formik';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { loginRegisterSchema } from '../../utils/form-validator';

/*
LoginRegisterForm component - provides fields for user login and registration.
Wrapped in Formik for validation via Yup and rendering any validation errors.
isRegister parameter controls which fields are displayed based on user registration form or login form.
*/
export default function LoginRegisterForm({ isRegister, onSubmit, generalError, setIsRegister }) {
    const initialValues = {
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    return (
        <>
            <Formik
                initialValues={initialValues}
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
                    <Form onSubmit={handleSubmit}>
                        <div className="audibird-logo text-center pb-4">
                            <img src="/audibird-high-resolution-logo-transparent.png" alt="Station" className="img-fluid mb-3" />
                        </div>

                        {isRegister && (
                            <>
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('name', true)}
                                        placeholder="Enter your name"
                                        isInvalid={touched.name && !!errors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('username', true)}
                                        placeholder="Enter username"
                                        isInvalid={touched.username && !!errors.username}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </>
                        )}
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={() => setFieldTouched('email', true)}
                                placeholder="Enter email"
                                isInvalid={touched.email && !!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={() => setFieldTouched('password', true)}
                                placeholder="Password"
                                isInvalid={touched.password && !!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>
                        {isRegister && (
                            <Form.Group className="mb-3" controlId="confirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={() => setFieldTouched('confirmPassword', true)}
                                    placeholder="Confirm Password"
                                    isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.confirmPassword}
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}

                        {/* General Error Message */}
                        {generalError && (
                            <Alert variant="danger" className="mb-3">
                                {generalError}
                            </Alert>
                        )}

                        {/* Submit/Back Buttons */}
                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner animation="border" size="sm" /> : (isRegister ? 'Register' : 'Login')}
                            </Button>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => setIsRegister(prev => !prev)}
                            >
                                {isRegister ? 'Already have an account? Login' : 'New User? Register here'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
}