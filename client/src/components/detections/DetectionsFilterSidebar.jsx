import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import Sidebar from '../common/Sidebar';
import { isValidDateRange, isValidMinConfidence, isValidMaxConfidence, isValidMinMaxRange} from '../../utils/valueValidator';


// DetectionFilterSidebar component to handle filtering options for detections
const DetectionsFilterSidebar = ({ show, onHide, filters, onFilterSubmit }) => (
  <Sidebar title="Filters" show={show} onHide={onHide}>
    <Formik
      initialValues={filters}
      validate={validate}
      onSubmit={onFilterSubmit}
      enableReinitialize
    >
      {({ handleSubmit, handleChange, values, errors, touched, setFieldTouched  }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Date Range</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="date"
                  name="from"
                  value={values.from}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched('from', true)}
                  isInvalid={!!errors.from && touched.from}
                  placeholder="From"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.from}
                </Form.Control.Feedback>
              </Col>
              <Col>
                <Form.Control
                  type="date"
                  name="to"
                  value={values.to}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched('to', true)}
                  isInvalid={!!errors.to && touched.to}
                  placeholder="To"
                />
              </Col>
            </Row>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Species</Form.Label>
            <Form.Control
              type="text"
              name="species"
              value={values.species}
              onChange={handleChange}
              placeholder="Species name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confidence (%)</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="number"
                  name="min_confidence"
                  value={values.min_confidence}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched('min_confidence', true)}
                  placeholder="Min"
                  min={0}
                  max={100}
                  isInvalid={!!errors.min_confidence && touched.min_confidence}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.min_confidence}
                </Form.Control.Feedback>
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  name="max_confidence"
                  value={values.max_confidence}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched('max_confidence', true)}
                  placeholder="Max"
                  min={0}
                  max={100}
                  isInvalid={!!errors.max_confidence && touched.max_confidence}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.max_confidence}
                </Form.Control.Feedback>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sort By</Form.Label>
            <Form.Select
              name="sort_by"
              value={values.sort_by}
              onChange={handleChange}
            >
              <option value="detection_timestamp">Detection Time</option>
              <option value="confidence">Confidence</option>
              <option value="common_name">Species Name</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sort Order</Form.Label>
            <Form.Select
              name="sort"
              value={values.sort}
              onChange={handleChange}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Apply Filters
          </Button>
        </Form>
      )}
    </Formik>
  </Sidebar>
);

// Validation function for the form values
const validate = values => {
    const errors = {};
    const { from, to, min_confidence, max_confidence } = values;

    if (!isValidMinConfidence(min_confidence)) {
        errors.min_confidence = 'Minimum confidence must be a number between 0 and 100.';
    }

    if (!isValidMaxConfidence(max_confidence)) {
        errors.max_confidence = 'Maximum confidence must be a number between 0 and 100.';
    }

    if (!isValidDateRange(from, to)) {
        errors.from = 'From date cannot be after To date.';
        errors.to = 'From date cannot be after To date.';
    }

    if (!isValidMinMaxRange(min_confidence, max_confidence)) {
        errors.min_confidence = 'Minimum confidence cannot be greater than maximum confidence.';
    }

    return errors;
};

export default DetectionsFilterSidebar;