import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { Form, Button, Alert, Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ComponentCard from '../common/ComponentCard';
import { stationSettingsSchema } from '../../utils/form-validator';
import SkeletonComponent from '../common/SkeletonPlaceholder';

/*
StationSettingsForm component. Provides a form for displaying and editing a stations settings.
Wrapped in Formik for validation via Yup and rendering any validation errors.
userCanEdit parameter controls whether form fields and submit button are disabled/enabled
*/
export default function StationSettingsForm({ onSubmit, loading, generalError, initialValues, userCanEdit }) {
    const [confidenceWarning, setConfidenceWarning] = useState('');
    const navigate = useNavigate();

    // Tooltips
    const minConfidenceTooltip = (
        <Tooltip id="min-confidence-tooltip">
            Recommended value: 25–75
        </Tooltip>
    );
    const latTooltip = (
        <Tooltip id="lat-tooltip">
            Latitude in decimal degrees (e.g. 54.60)
        </Tooltip>
    );
    const lonTooltip = (
        <Tooltip id="lon-tooltip">
            Longitude in decimal degrees (e.g. -5.92)
        </Tooltip>
    );
    const diskTooltip = (
        <Tooltip id="disk-tooltip">
            This is the total percentage of disk space which can be used by audio files before automatic storage management commences (e.g. 80)
        </Tooltip>
    );

    return (
        <ComponentCard title={`Station Settings`}>

            {generalError && (
                <Alert variant="danger" className="mb-3">
                    {generalError}
                </Alert>
            )}

            {loading ? <SkeletonComponent height={400}/> : (
                <Formik
                    initialValues={initialValues}
                    validationSchema={stationSettingsSchema()}
                    validate={values => {                       // minConfidence warning
                        if (values.minConfidence > 75) {
                            setConfidenceWarning('Setting minimum confidence greater than 75 may significantly reduce the quantity of detections.');
                        } else if (values.minConfidence < 25) {
                            setConfidenceWarning('Setting minimum confidence less than 25 may increase quantity of inaccurate detections.');
                        } else {
                            setConfidenceWarning('');
                        }
                        return {};
                    }}
                    onSubmit={onSubmit}
                    enableReinitialize
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
                            <Form.Group as={Row} className="mb-3" controlId="stationName">
                                <Form.Label column sm={3}>Station Name</Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        name="stationName"
                                        value={values.stationName}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('stationName', true)}
                                        placeholder="Enter station name"
                                        isInvalid={touched.stationName && !!errors.stationName}
                                        disabled={!userCanEdit}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.stationName}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="locationDesc">
                                <Form.Label column sm={3}>Location Description</Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        name="locationDesc"
                                        value={values.locationDesc}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('locationDesc', true)}
                                        placeholder="Enter location description"
                                        isInvalid={touched.locationDesc && !!errors.locationDesc}
                                        disabled={!userCanEdit}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.locationDesc}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="latlon">
                                <Form.Label column sm={3}>Latitude / Longitude</Form.Label>
                                <Col sm={4}>
                                    <OverlayTrigger placement="top" overlay={latTooltip}>
                                        <Form.Control
                                            type="number"
                                            name="lat"
                                            value={values.lat}
                                            onChange={handleChange}
                                            onBlur={() => setFieldTouched('lat', true)}
                                            placeholder="Latitude"
                                            isInvalid={touched.lat && !!errors.lat}
                                            step="any"
                                            disabled={!userCanEdit}
                                        />
                                    </OverlayTrigger>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lat}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col sm={5}>
                                    <OverlayTrigger placement="top" overlay={lonTooltip}>
                                        <Form.Control
                                            type="number"
                                            name="lon"
                                            value={values.lon}
                                            onChange={handleChange}
                                            onBlur={() => setFieldTouched('lon', true)}
                                            placeholder="Longitude"
                                            isInvalid={touched.lon && !!errors.lon}
                                            step="any"
                                            disabled={!userCanEdit}
                                        />
                                    </OverlayTrigger>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lon}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="minConfidence">
                                <Form.Label column sm={3}>
                                    Min Confidence (%)
                                </Form.Label>
                                <Col sm={9}>
                                    <OverlayTrigger placement="top" overlay={minConfidenceTooltip}>
                                        <Form.Control
                                            type="number"
                                            name="minConfidence"
                                            value={values.minConfidence}
                                            onChange={handleChange}
                                            onBlur={() => setFieldTouched('minConfidence', true)}
                                            placeholder="Enter minimum confidence"
                                            isInvalid={touched.minConfidence && !!errors.minConfidence}
                                            step="1"
                                            min="0"
                                            max="100"
                                            disabled={!userCanEdit}
                                        />
                                    </OverlayTrigger>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.minConfidence}
                                    </Form.Control.Feedback>
                                    {confidenceWarning && (
                                        <div className="alert alert-warning mt-2">{confidenceWarning}</div>
                                    )}
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="storagePolicy">
                                <Form.Label column sm={3}>
                                    Storage Policy
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        name="storagePolicy"
                                        value={values.storagePolicy}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('storagePolicy', true)}
                                        placeholder="Default"
                                        isInvalid={touched.storagePolicy && !!errors.storagePolicy}
                                        disabled
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.storagePolicy}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="maxStoragePercent">
                                <Form.Label column sm={3}>
                                    Max Disk Usage (%)
                                </Form.Label>
                                <Col sm={9}>
                                    <OverlayTrigger placement="top" overlay={diskTooltip}>
                                        <Form.Control
                                            type="text"
                                            name="maxStoragePercent"
                                            value={values.maxStoragePercent}
                                            onChange={handleChange}
                                            onBlur={() => setFieldTouched('maxStoragePercent', true)}
                                            placeholder="Enter max storage percent"
                                            step="1"
                                            min="50"
                                            max="100"
                                            disabled={!userCanEdit}
                                            isInvalid={touched.maxStoragePercent && !!errors.maxStoragePercent}
                                        />
                                    </OverlayTrigger>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.maxStoragePercent}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="success" 
                                    type="submit" 
                                    disabled={!userCanEdit || isSubmitting}>
                                    {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Save Settings'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </ComponentCard>
    );
}