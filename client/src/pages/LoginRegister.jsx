import React from 'react';
import { Container, Card } from 'react-bootstrap';
import UserStationsProvider from '../providers/UserStationsProvider';
import LoginRegisterContainer from '../components/login/LoginRegisterContainer';

// Main LoginRegister component that wraps the login/register section in the UserStationsProvider
export default function LoginRegister() {
    return (
        <UserStationsProvider>
                <Container fluid className="login-background d-flex align-items-center justify-content-center">
                    <Card className="p-4 shadow" style={{ minWidth: 480 }}>
                        <Card.Body>
                            <LoginRegisterContainer />
                    </Card.Body>
                </Card>
            </Container>
        </UserStationsProvider>
    );
}