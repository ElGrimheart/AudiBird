import React from 'react';
import { Formik } from 'formik';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import ComponentCard from '../common/ComponentCard';
import * as Yup from 'yup';

const userPreferencesSchema = Yup.object().shape({
    dailySummaryEmail: Yup.boolean(),
    newDetectionInApp: Yup.boolean(),
    newDetectionInAppThreshold: Yup.number().min(0).max(100),
    newDetectionEmail: Yup.boolean(),
    newDetectionEmailThreshold: Yup.number().min(0).max(100),
    lowStorageAlert: Yup.boolean(),
});

/*
UserPreferencesForm component
Handles displaying and updating user notification preferences.
Wrapped in Formik for form state management and validation via Yup
*/
export default function UserPreferencesForm({ initialValues, loading, generalError, onSubmit, userCanEdit }) {
    return (
        <ComponentCard title={`Notification Preferences`}>
            <div>
                {generalError && (
                    <Alert variant="danger" className="mb-3">
                        {generalError}
                    </Alert>
                )}
                {loading ? <Spinner animation="border" /> : (
                    <Formik
                        initialValues={initialValues}
                        validationSchema={userPreferencesSchema}
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
                                <Form.Group as={Row} className="d-flex align-items-center" controlId="dailySummaryEmail">
                                    <Col sm={6} className="d-flex align-items-center">
                                        <Form.Check
                                            type="checkbox"
                                            name="dailySummaryEmail"
                                            label="Daily Station Summary Email"
                                            checked={values.dailySummaryEmail}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Form.Group>

                                <hr className="my-4" />
                                <p>New Detection Alerts:</p>
                                    <Form.Group as={Row} className="d-flex align-items-center" controlId="newDetectionInApp">
                                        <Col sm={6} className="d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                name="newDetectionInApp"
                                                label="In-app"
                                                checked={values.newDetectionInApp}
                                                onChange={handleChange}
                                            />
                                            <Form.Control
                                                type="number"
                                                name="newDetectionInAppThreshold"
                                                value={values.newDetectionInAppThreshold}
                                                onChange={handleChange}
                                                onBlur={() => setFieldTouched('newDetectionInAppThreshold', true)}
                                                placeholder="Confidence Threshold"
                                                isInvalid={touched.newDetectionInAppThreshold && !!errors.newDetectionInAppThreshold}
                                                min="0"
                                                max="100"
                                                disabled={!values.newDetectionInApp}
                                                className="ms-3"
                                                style={{ maxWidth: 80 }}
                                            />
                                            <Form.Text className="text-muted d-inline ms-2">
                                                % min confidence
                                            </Form.Text>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="d-flex align-items-center" controlId="newDetectionEmail">
                                        <Col sm={6} className="d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                name="newDetectionEmail"
                                                label="Emails"
                                                checked={values.newDetectionEmail}
                                                onChange={handleChange}
                                            />
                                            <Form.Control
                                                type="number"
                                                name="newDetectionEmailThreshold"
                                                value={values.newDetectionEmailThreshold}
                                                onChange={handleChange}
                                                onBlur={() => setFieldTouched('newDetectionEmailThreshold', true)}
                                                placeholder="Confidence Threshold"
                                                isInvalid={touched.newDetectionEmailThreshold && !!errors.newDetectionEmailThreshold}
                                                min="0"
                                                max="100"
                                                disabled={!values.newDetectionEmail}
                                                className="ms-3"
                                                style={{ maxWidth: 80 }}
                                            />
                                            <Form.Text className="text-muted d-inline ms-2">
                                                % min confidence
                                            </Form.Text>
                                        </Col>
                                    </Form.Group>
                                {/*Only show system notifications to owners/admins*/}
                                {userCanEdit && (
                                    <>
                                        <hr className="my-4" />
                                        <p>System Notifications:</p>
                                        <Form.Group as={Row} className="d-flex align-items-center" controlId="lowStorageAlert">
                                            <Col sm={6} className="d-flex align-items-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="lowStorageEmail"
                                                    label="Low storage"
                                                    checked={values.lowStorageEmail}
                                                    onChange={handleChange}
                                                />
                                                <Form.Control
                                                    type="number"
                                                    name="lowStorageEmailThreshold"
                                                    value={values.lowStorageEmailThreshold}
                                                    onChange={handleChange}
                                                    onBlur={() => setFieldTouched('lowStorageEmailThreshold', true)}
                                                    placeholder="Threshold"
                                                    isInvalid={touched.lowStorageEmailThreshold && !!errors.lowStorageEmailThreshold}
                                                    min="0"
                                                    max="95"
                                                    disabled={!values.lowStorageEmail}
                                                    className="ms-3"
                                                    style={{ maxWidth: 80 }}
                                                />
                                                <Form.Text className="text-muted d-inline ms-2">
                                                    % storage used
                                                </Form.Text>
                                            </Col>
                                        </Form.Group>
                                    </>
                                )}

                                <div className="d-grid gap-2 mt-3">
                                    <Button variant="success" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Save Preferences'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </ComponentCard>
    );
}