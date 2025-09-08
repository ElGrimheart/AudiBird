import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Col, Spinner } from 'react-bootstrap';
import UserPrefencesForm from './UserPreferencesForm';
import SelectedStationContext from '../../contexts/SelectedStationContext';
import UserStationsContext from '../../contexts/UserStationsContext';
import UserPreferencesContext from '../../contexts/UserPreferencesContext';
import { STATION_USER_TYPES } from '../../constants/type-ids';

/*
UserPreferencesContainer component
Retrieves initial station preferences and user permissions, passing them to the UserPreferencesForm.
Handles form submission and parsing any API errors received in the response for display in event of Formik failure
 */
export default function NotificationSettingsContainer() {
    const navigate = useNavigate();
    const { selectedStation } = useContext(SelectedStationContext);
    const { usersStations } = useContext(UserStationsContext);
    const { userPreferences, loading, updateUserPreferences } = useContext(UserPreferencesContext);
    const [generalError, setGeneralError] = useState(null);

    const initialValues = {
        dailySummaryEmail: userPreferences ? userPreferences.dailySummaryEmail : false,
        newDetectionInApp: userPreferences ? userPreferences.newDetectionInApp : false,
        newDetectionInAppThreshold: ((userPreferences ? userPreferences.newDetectionInAppThreshold : 0)*100).toFixed(0),
        newDetectionEmail: userPreferences ? userPreferences.newDetectionEmail : false,
        newDetectionEmailThreshold: ((userPreferences ? userPreferences.newDetectionEmailThreshold : 0)*100).toFixed(0),
        lowStorageEmail: userPreferences ? userPreferences.lowStorageEmail : false,
        lowStorageEmailThreshold: ((userPreferences ? userPreferences.lowStorageEmailThreshold : 0)*100).toFixed(0)
    };

    // Check which preferences the user can view/edit based on their station role
    const userCanEdit = usersStations.find(station =>
        station.station_id === selectedStation &&
        (station.station_user_type_id === STATION_USER_TYPES.Owner || station.station_user_type_id === STATION_USER_TYPES.Admin)
    );

    // Submit updated preferences
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        const payload = {
            ...values,
            newDetectionInAppThreshold: values.newDetectionInAppThreshold / 100,
            newDetectionEmailThreshold: values.newDetectionEmailThreshold / 100,
            lowStorageEmailThreshold: values.lowStorageEmailThreshold / 100,
        };

        const result = await updateUserPreferences(payload);
        
        // redirect to dashboard on success
        if (result?.status === 200 && result?.data?.result) {
            navigate('/dashboard', { replace: true });
        }

        // otherwise map API errors to form errors
        if (!result.success && result.error?.response?.data?.errors) {
            const apiErrors = result.error.response.data.errors.reduce((acc, curr) => {
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
                <UserPrefencesForm
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