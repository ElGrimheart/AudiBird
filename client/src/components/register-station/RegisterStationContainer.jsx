import React, { useContext, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Container, Col, Spinner } from 'react-bootstrap';
import RegisterStationForm from '../register-station/RegisterStationForm';
import useRegisterStation from '../../hooks/useRegisterStation';
import UserStationsContext from '../../contexts/UserStationsContext';
import SelectedStationContext from '../../contexts/SelectedStationContext';

/*
RegisterStationContainer component - container for the register station form
Handles form submission and parsing any API errors received in the response for display in event of Formik failure
*/
export default function RegisterStationContainer() {
    //const navigate = useNavigate();
    const { fetchUserStations } = useContext(UserStationsContext);
    const { setSelectedStation } = useContext(SelectedStationContext);
    const { registerStation, loading } = useRegisterStation(fetchUserStations);
    const [generalError, setGeneralError] = useState(null);

    const initialValues = {
        stationId: '',
        stationApiKey: ''
    };

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        const result = await registerStation(values);
        console.log("register station result", result);

        // Fetch updated user station list and permissions if successful and redirect to station settings
        if (result?.status === 200 && result?.data?.result) {
            console.log("New Station Registered:", result.data.result);
            await fetchUserStations();
            setSelectedStation(values.stationId);
            window.location.href = '/station-settings';
        }

        // Otherwise map API errors to Formik fields
        if (!result?.success && result?.error?.response?.data?.errors) {
            const apiErrors = result.error.response.data.errors.reduce((acc, curr) => {
                acc[curr.path] = curr.msg;
                return acc;
            }, {});
            setErrors(apiErrors);
            setGeneralError(null);
        } else if (!result?.success && result?.error?.response?.data?.error) {
            setGeneralError(result.error.response.data.error);
        }
        setSubmitting(false);
    };

    return (
        <Container className="p-4">
            <Col md={6} lg={8} className="mx-auto">
                <RegisterStationForm
                    initialValues={initialValues}
                    loading={loading}
                    generalError={generalError}
                    onSubmit={handleSubmit}
                />
            </Col>
        </Container>
    );
}