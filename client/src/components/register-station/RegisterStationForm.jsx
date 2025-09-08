import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { Form, Button, Alert, Spinner, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ComponentCard from '../common/ComponentCard';
import { registerStationSchema } from '../../utils/form-validator';
import SkeletonComponent from '../common/SkeletonPlaceholder';

/*
RegisterStationForm component - form for registering a new station
Wrapped in Formik for validation via Yup and rendering any validation errors
*/
export default function RegisterStationForm({ onSubmit, loading, generalError, initialValues }) {
    const navigate = useNavigate();

    // Tooltips
    const stationIdFormat = (
        <Tooltip id="min-confidence-tooltip">
            Enter station ID in the format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
        </Tooltip>
    );

    const stationApiKeyFormat = (
        <Tooltip id="min-confidence-tooltip">
            Enter station API key in the format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
        </Tooltip>
    );

    return (
        <ComponentCard title={`Station Settings`}>

            {generalError && (
                <Alert variant="danger" className="mb-3">
                    {generalError}
                </Alert>
            )}

            {loading ? <SkeletonComponent /> : (
                <Formik
                    initialValues={initialValues}
                    validationSchema={registerStationSchema()}
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
                            <Form.Group as={Row} className="mb-3" controlId="stationId">
                                <Form.Label column sm={3}>Station ID</Form.Label>
                                <Col sm={9}>
                                    <OverlayTrigger placement="top" overlay={stationIdFormat}>
                                        <Form.Control
                                            type="text"
                                            name="stationId"
                                            value={values.stationId}
                                            onChange={handleChange}
                                            onBlur={() => setFieldTouched('stationId', true)}
                                            placeholder="Enter station ID"
                                            isInvalid={touched.stationId && !!errors.stationId}
                                        />
                                    </OverlayTrigger>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.stationId}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3" controlId="stationApiKey">
                                <Form.Label column sm={3}>Station API Key</Form.Label>
                                <Col sm={9}>
                                    <OverlayTrigger placement="top" overlay={stationApiKeyFormat}>
                                        <Form.Control
                                            type="text"
                                            name="stationApiKey"
                                            value={values.stationApiKey}
                                            onChange={handleChange}
                                            onBlur={() => setFieldTouched('stationApiKey', true)}
                                            placeholder="Enter station API key"
                                            isInvalid={touched.stationApiKey && !!errors.stationApiKey}
                                        />
                                    </OverlayTrigger>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.stationApiKey}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>  
                            <div className="d-grid gap-2">
                                <Button variant="success" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 
                                        <Spinner animation="border" size="sm" /> : 'Register Station'
                                    }
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