/* Utility functions for validating user form input values */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
const nameRegex = /^[A-Za-z ]{2,}$/;
const passwordNoSpacesRegex = /^\S{10,}$/;
const registerPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{10,}$/;

// Returns initial values for user form based on whether it's a registration or login form
export function getInitialValues(isRegister) {
  return isRegister
    ? { name: '', username: '', email: '', password: '', confirm_password: '' }
    : { email: '', password: '' };
}

// Validates user form input values
export function validateUserForm(values, isRegister) {
  const errors = {};
  const { name, username, email, password, confirm_password } = values;

  // Email
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Password
  if (!password) {
    errors.password = 'Password is required.';
  } else if (isRegister) {
    if (!registerPasswordRegex.test(password)) {
      errors.password =
        'Password must contain: \n- At least 12 characters\n- At least 1 uppercase letter\n- At least 1 lowercase letter\n- At least 1 special character';
    }
  } else {
    if (!passwordNoSpacesRegex.test(password)) {
      errors.password = 'Invalid password format.';
    }
  }

  if (isRegister) {
    // Name
    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (!nameRegex.test(name.trim())) {
      errors.name = 'Name can only contain letters and spaces.';
    }

    // Username
    if (!username || username.length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!usernameRegex.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    // Confirm Password
    if (!confirm_password) {
      errors.confirm_password = 'Please confirm your password.';
    } else if (confirm_password !== password) {
      errors.confirm_password = 'Passwords do not match.';
    }
  } 

  return errors;
}