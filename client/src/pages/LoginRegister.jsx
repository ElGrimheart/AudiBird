import React from 'react';
import { Container, Card } from 'react-bootstrap';
import UserStationsProvider from '../providers/UserStationsProvider';
import LoginRegisterContainer from '../components/login/LoginRegisterContainer';

// Main LoginRegister component that wraps the login/register form the station provider
const LoginRegister = () => (
    <UserStationsProvider>
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
            <Card className="p-4 shadow" style={{ minWidth: 480 }}>
                <Card.Body>
                    <LoginRegisterContainer />
                </Card.Body>
            </Card>
        </Container>
    </UserStationsProvider>
);

export default LoginRegister;