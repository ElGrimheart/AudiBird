import React, { useContext } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import StationMetadataContext from '../../contexts/StationMetadataContext';
import { formatHtmlInputToDate } from '../../utils/dateFormatter';
import { Formik } from 'formik';
import { analyticsFiltersSchema } from '../../utils/formValidator';

// Filter bar component for analytics charts, allowing users to set date range, species, and confidence filters
// Reused across different analytics components with options to show/hide specific filters
export default function ChartFilterBar({ 
    filters, 
    setFilters, 
    onApplyFilters,
    showSingleDate = false,
    showDateRange = false,
    showSpeciesSelect = false,
    showMinConfidence = false
}) {
    const { stationDateRange, stationSpeciesList } = useContext(StationMetadataContext);

    return (
        <Formik
            initialValues={filters}
            validationSchema={analyticsFiltersSchema}
            onSubmit={(values, { setSubmitting }) => {
                setFilters(values);
                if (onApplyFilters) onApplyFilters(values);
                setSubmitting(false);
                }}
            enableReinitialize
        >
            {({
            handleSubmit,
            handleChange,
            values,
            errors,
            touched,
            setFieldTouched,
            isSubmitting
            }) => (
                
                <Form onSubmit={handleSubmit} className="p-3 border rounded bg-light mb-3 shadow-sm">
                    <Row className="mb-3">
                        {errors.general && (
                            <div className="alert alert-danger">{errors.general}</div>
                        )}

                        {showSingleDate && (
                            <>
                                <Col md={2}>
                                    <Form.Label>Select Date:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="singleDate"
                                        value={formatHtmlInputToDate(values.singleDate) || ""}
                                        min={formatHtmlInputToDate(stationDateRange.startDate) || ""}
                                        max={formatHtmlInputToDate(stationDateRange.endDate) || ""}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched("singleDate", true)}
                                        isInvalid={!!errors.singleDate && touched.singleDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.singleDate}
                                    </Form.Control.Feedback>
                                </Col>
                            </>
                        )}

                        {showDateRange && (
                            <>
                                <Col md={2}>
                                    <Form.Label>From:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="startDate"
                                        value={formatHtmlInputToDate(values.startDate) || ""}
                                        min={formatHtmlInputToDate(stationDateRange.startDate) || ""}
                                        max={formatHtmlInputToDate(stationDateRange.endDate) || ""}
                                        onChange={handleChange}
                                        onBlur={() => setFieldTouched('startDate', true)}
                                        isInvalid={!!errors.startDate && touched.startDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.startDate}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col md={2}>
                                    <Form.Label>To:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="endDate"
                                        value={formatHtmlInputToDate(values.endDate) || ""}
                                        min={formatHtmlInputToDate(stationDateRange.startDate) || ""}
                                        max={formatHtmlInputToDate(stationDateRange.endDate) || ""}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </>
                        )}

                        {showSpeciesSelect && (
                            <Col md={2}>
                                <Form.Label>Species:</Form.Label>
                                <Form.Select
                                    name="species"
                                    value={values.species}
                                    onChange={handleChange}
                                    onBlur={() => setFieldTouched('species', true)}
                                    isInvalid={!!errors.species && touched.species}
                                >
                                    <option value="">All Species</option>
                                    {stationSpeciesList?.map(species => (
                                        <option key={species} value={species}>{species}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                        {errors.species}
                                    </Form.Control.Feedback>
                            </Col>
                        )}

                        {showMinConfidence && (
                            <Col md={2}>
                                <Form.Label>Min Confidence (%):</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="number"
                                        name="minConfidence"
                                        value={values.minConfidence || ""}
                                        onChange={handleChange}
                                        placeholder="e.g."
                                        min={0}
                                        max={100}
                                        onBlur={() => setFieldTouched('minConfidence', true)}
                                        isInvalid={!!errors.minConfidence && touched.minConfidence}
                                    />
                                    <InputGroup.Text>%</InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.minConfidence}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                        )}
                        <Col md={2} className="d-flex align-items-end">
                            <Button
                                type="submit" 
                                disabled={isSubmitting}
                                variant='primary' 
                                className="mt-3"
                            >
                                Apply Filters
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}
        </Formik>
    );
}