import React, { useState, useContext } from 'react';
import LoginRegisterForm from './LoginRegisterForm';
import useLoginRegister from '../../hooks/useLoginRegister';
import UserStationsContext from '../../contexts/UserStationsContext';

// LoginRegisterContainer component to handle user login and registration
export default function LoginRegisterContainer() {
    const [isRegister, setIsRegister] = useState(false);
    const { fetchUserStations } = useContext(UserStationsContext);
    const { loginOrRegister, generalError } = useLoginRegister(fetchUserStations);

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        await loginOrRegister(values, isRegister, setSubmitting, setErrors);
    };

    return (
        <LoginRegisterForm
            isRegister={isRegister}
            onSubmit={handleSubmit}
            generalError={generalError}
            setIsRegister={setIsRegister}
        />
    );
}