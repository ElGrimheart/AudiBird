import React from 'react';
import { Container, Card } from 'react-bootstrap';
import LoginRegisterContainer from '../components/login/LoginRegisterContainer';

const LoginRegister = () => (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
        <Card className="p-4 shadow" style={{ minWidth: 480 }}>
            <Card.Body>
                <LoginRegisterContainer />
            </Card.Body>
        </Card>
    </Container>
);

export default LoginRegister;