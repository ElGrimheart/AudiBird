import React from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

// Resusable UserForm component. Accepts fields, onSubmit handler, submit button text, secondary button text and action, general error message, and submission state.
const UserForm = ({ fields, onSubmit, submitText, secondaryText, onSecondary, secondaryType = "button", generalError, isSubmitting = false }) => (
  <Form onSubmit={onSubmit}>
    {generalError && (
      <Alert variant="danger" className="mb-3">
        {generalError}
      </Alert>
    )}
    {fields.map(({ label, type, name, value, onChange, onBlur, placeholder, required, error }) => (
      <Form.Group className="mb-3" controlId={name} key={name}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          isInvalid={!!error}
        />
        <Form.Control.Feedback type="invalid">
          {Array.isArray(error)
            ? error.map((msg, idx) => <div key={idx}>{msg}</div>)
            : error}
        </Form.Control.Feedback>
      </Form.Group>
    ))}
    <div className="d-grid gap-2">
      <Button variant="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner animation="border" size="sm" /> : submitText}
      </Button>
      {secondaryText && (
        <Button
          variant="secondary"
          type={secondaryType}
          onClick={onSecondary}
        >
          {secondaryText}
        </Button>
      )}
    </div>
  </Form>
);

export default UserForm;