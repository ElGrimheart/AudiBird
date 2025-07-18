const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
const nameRegex = /^[A-Za-z ]{2,}$/;
const passwordNoSpacesRegex = /^\S{10,}$/;
const registerPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{10,}$/;

export function getInitialValues(isRegister) {
  return isRegister
    ? { name: '', username: '', email: '', password: '', confirmPassword: '' }
    : { email: '', password: '' };
}

export function validateAuth(values, isRegister) {
  const errors = {};

  // Email
  if (!values.email) {
    errors.email = 'Email is required.';
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Password
  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (isRegister) {
    if (!registerPasswordRegex.test(values.password)) {
      errors.password =
        'Password must contain: \n- At least 10 characters\n- At least 1 uppercase letter\n- At least 1 lowercase letter\n- At least 1 special character';
    }
  } else {
    if (!passwordNoSpacesRegex.test(values.password)) {
      errors.password = 'Invalid password format.';
    }
  }

  // Name 
  if (isRegister) {
    if (!values.name || values.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (!nameRegex.test(values.name.trim())) {
      errors.name = 'Name can only contain letters and spaces.';
    }
  }

  // Username 
  if (isRegister) {
    if (!values.username || values.username.length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!usernameRegex.test(values.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores.';
    }
  }

  // Confirm Password 
  if (isRegister) {
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return errors;
}