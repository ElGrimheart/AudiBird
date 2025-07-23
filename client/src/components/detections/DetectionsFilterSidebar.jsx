import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import { detectionFiltersSchema } from '../../utils/userValueValidator';
import Sidebar from '../common/Sidebar';


// DetectionFilterSidebar component to handle filtering options for detections
const DetectionsFilterSidebar = ({ show, onHide, filters, onFilterSubmit, error }) => (
  <Sidebar title="Filters" show={show} onHide={onHide}>
    {error && error.general && (
      <div className="alert alert-danger mb-3">
        {error.general} {/* Display all errors in the general message */}
      </div>
  )}
    <Formik
      initialValues={filters}
      //validationSchema={detectionFiltersSchema}
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
              <Col>
                <Form.Control
                                      //Date input for filtering detections by FROM date
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
                                      //Date input for filtering detections by TO date
                  type="date"
                  name="to"
                  value={values.to}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched('to', true)}
                  isInvalid={!!errors.to && touched.to}
                  placeholder="To"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.to}
                </Form.Control.Feedback>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Species</Form.Label>
            <Form.Control
                                      // Species search input
              type="text"
              name="species"
              value={values.species}
              onBlur={() => setFieldTouched('species', true)}
              onChange={handleChange}
              placeholder="Species name"
              isInvalid={!!errors.species && touched.species}
            />
            <Form.Control.Feedback type="invalid">
              {errors.species}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confidence (%)</Form.Label>
            <Row>
              <Col>
                <Form.Control
                                      // Min confidence input
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
                                        // Max confidence input
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
                                        // Sort by selection
              name="sort_by"
              value={values.sort_by}
              onChange={handleChange}
              isInvalid={!!errors.sort_by && touched.sort_by}
            >
              <option value="detection_timestamp">Detection Time</option>
              <option value="confidence">Confidence</option>
              <option value="common_name">Species Name</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.sort_by}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sort Order</Form.Label>
            <Form.Select
                                        // Sort order selection
              name="sort"
              value={values.sort}
              onChange={handleChange}
              isInvalid={!!errors.sort && touched.sort}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.sort}
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Apply Filters
          </Button>
        </Form>
      )}
    </Formik>
  </Sidebar>
);

export default DetectionsFilterSidebar;
