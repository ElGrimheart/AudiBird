import bcrypt from "bcrypt";

// Hashes the users password using bcrypt and returns the hashed password
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compares the users password with the hashed password in the database. Returns true if the passwords match, otherwise returns false
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}


print(hashPassword("password123"));