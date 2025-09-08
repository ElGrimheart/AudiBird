import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Col, Spinner } from 'react-bootstrap';
import StationSettingsForm from './StationSettingsForm';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import UserStationsContext from '../../contexts/UserStationsContext';
import useStationSettings from '../../hooks/useStationSettings';
import { STATION_USER_TYPES } from '../../constants/type-ids';

/*
StationSettingsContainer component. Manages the state and logic for the StationSettingsForm.
Retrieves initial station settings and user permissions, passing them to the StationSettingsForm.
Handles form submission and parsing any API errors received in the response for display in event of Formik failure
*/
export default function StationSettingsContainer() {
    const navigate = useNavigate();
    const { selectedStation } = useContext(SelectedStationContext);
    const { stationSettings, loading, updateStationSettings } = useStationSettings(selectedStation);
    const { usersStations, fetchUserStations } = useContext(UserStationsContext);
    const [generalError, setGeneralError] = useState(null);

    const initialValues = {
        stationName: stationSettings ? stationSettings.station.station_name : '',
        lat: stationSettings ? stationSettings.station.location.lat : '0',
        lon: stationSettings ? stationSettings.station.location.lon : '0',
        locationDesc: stationSettings ? stationSettings.station.location.desc : '',
        minConfidence: (stationSettings ? stationSettings.detection_config.min_confidence * 100 : 0).toFixed(0),
        storagePolicy: stationSettings ? stationSettings.storage_manager.storage_policy : 'Default',
        maxStoragePercent: (stationSettings ? stationSettings.storage_manager.max_storage_usage_percent : 90),
    };

    // Check if user has edit permissions
    const userCanEdit = usersStations.find(station => 
        station.station_id === selectedStation && 
        (station.station_user_type_id === STATION_USER_TYPES.Owner || station.station_user_type_id === STATION_USER_TYPES.Admin)
    );


    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        const result = await updateStationSettings(values);

        // Re-fetch users station list if successful - updates navbar state with new station name
        if (result?.status === 200 && result?.data?.result) {
            await fetchUserStations();
            navigate('/dashboard', { replace: true });
        }

        if (!result.success && result.error?.response?.data?.errors) {
            console.log("API errors:", result.error.response.data.errors);
            const apiErrors = result.error.response.data.errors.reduce((acc, curr) => { // Mapping API error response to Formik fields
                acc[curr.path] = curr.msg;
                return acc;
            }, {});
            setErrors(apiErrors);
        } else if (!result?.success && result?.error?.response?.data?.error) {
            setGeneralError(result.error.response.data.error);
        }
        setSubmitting(false);
    };

    return (
        <Container className="p-4">
            <Col md={6} lg={8} className="mx-auto">
                <StationSettingsForm
                    initialValues={initialValues}
                    loading={loading}
                    generalError={generalError}
                    onSubmit={handleSubmit}
                    userCanEdit={userCanEdit}
                />
            </Col>
        </Container>
    );
}