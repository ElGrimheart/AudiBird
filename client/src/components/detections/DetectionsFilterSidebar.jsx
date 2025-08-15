import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import { detectionFiltersSchema } from '../../utils/form-validator';
import Sidebar from '../common/Sidebar';

/* DetectionsFilterSidebar component to handle filtering options for detections
   Displays a sidebar with for filtering detections by date range, species, confidence.
   Wrapped in Formik for validation, submission handling and error reporting
*/
export default function DetectionsFilterSidebar({ show, onHide, filters, onFilterSubmit, error }) {
    return (
        <Sidebar title="Filters" show={show} onHide={onHide}>

            {/* Display general error messages */}
            {error && error.general && (
                <div className="alert alert-danger mb-3">
                    {error.general}
                </div>
            )}

            <Formik
                initialValues={filters}
                validationSchema={detectionFiltersSchema()}
                onSubmit={onFilterSubmit}
                enableReinitialize
            >
                {({
                    handleSubmit,
                    handleChange,
                    values,
                    errors,
                    touched, 
                    setFieldTouched  
                }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Date Range</Form.Label>
                            <Row>
                                <Col className="d-flex align-items-center">
                                    <Form.Label htmlFor="startDate" className="me-2 mb-0">From:</Form.Label>
                                    <Form.Control
                                        // Start date filter
                                        type="datetime-local"
                                        name="startDate"
                                        value={values.startDate}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('startDate', true)}
                                        isInvalid={!!errors.startDate && touched.startDate}
                                        placeholder="Start Date"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.startDate}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col className="d-flex align-items-center">
                                    <Form.Label htmlFor="endDate" className="me-4 mb-0">To:</Form.Label>
                                    <Form.Control
                                        // End date filter
                                        type="datetime-local"
                                        name="endDate"
                                        value={values.endDate}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('endDate', true)}
                                        isInvalid={!!errors.endDate && touched.endDate}
                                        placeholder="End Date"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.endDate}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Species Search</Form.Label>
                            <Form.Control
                                // Species search input
                                type="text"
                                name="speciesName"
                                value={values.speciesName}
                                onBlur={() => setFieldTouched('speciesName', true)}
                                onChange={handleChange}
                                placeholder="Species name"
                                isInvalid={!!errors.speciesName && touched.speciesName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.speciesName}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confidence</Form.Label>
                            <Row>
                                <Col>
                                    <Form.Control
                                        // Min confidence input
                                        type="number"
                                        name="minConfidence"
                                        value={values.minConfidence}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('minConfidence', true)}
                                        placeholder="Min %"
                                        step="1"
                                        min={0}
                                        max={100}
                                        isInvalid={!!errors.minConfidence && touched.minConfidence}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.minConfidence}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col>
                                    <Form.Control
                                        // Max confidence input
                                        type="number"
                                        name="maxConfidence"
                                        value={values.maxConfidence}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('maxConfidence', true)}
                                        placeholder="Max %"
                                        min={0}
                                        max={100}
                                        step="1"
                                        isInvalid={!!errors.maxConfidence && touched.maxConfidence}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.maxConfidence}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sort By</Form.Label>
                            <Form.Select
                                // Sort by selection
                                name="sortBy"
                                value={values.sortBy}
                                onChange={handleChange}
                                isInvalid={!!errors.sortBy && touched.sortBy}
                            >
                                <option value="detection_timestamp">Detection Time</option>
                                <option value="confidence">Confidence</option>
                                <option value="common_name">Species Name</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.sortBy}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sort Order</Form.Label>
                            <Form.Select
                            // Sort order selection
                                name="sortOrder"
                                value={values.sortOrder}
                                onChange={handleChange}
                                isInvalid={!!errors.sortOrder && touched.sortOrder}
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.sortOrder}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">
                            Apply Filters
                        </Button>
                    </Form>
                    )}
            </Formik>
        </Sidebar>
    );
}