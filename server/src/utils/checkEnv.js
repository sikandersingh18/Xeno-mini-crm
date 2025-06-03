const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a secure random JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const requiredEnvVars = {
  PORT: '5000',
  MONGO_URI: 'mongodb://localhost:27017/xeno_crm',
  CLIENT_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: '542246581159-h1blfvmshmu95ej8hlp4t5og74pjhf8c.apps.googleusercontent.com',
  JWT_SECRET: generateJwtSecret(),
  NODE_ENV: 'development'
};

const serverEnvPath = path.join(__dirname, '.env');
const clientEnvPath = path.join(__dirname, '..', 'client', '.env');

// Check and create server .env
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = Object.entries(requiredEnvVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Server .env file created');
} else {
  // Read existing .env file
  const existingEnv = fs.readFileSync(serverEnvPath, 'utf8');
  const envLines = existingEnv.split('\n');
  const existingVars = {};
  
  // Parse existing variables
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      existingVars[key.trim()] = value.trim();
    }
  });

  // Check for missing variables and add them
  let updated = false;
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!existingVars[key]) {
      envLines.push(`${key}=${value}`);
      updated = true;
    }
  });

  // If JWT_SECRET is missing or empty, generate a new one
  if (!existingVars.JWT_SECRET || existingVars.JWT_SECRET.length < 32) {
    const jwtLine = envLines.findIndex(line => line.startsWith('JWT_SECRET='));
    const newSecret = generateJwtSecret();
    if (jwtLine >= 0) {
      envLines[jwtLine] = `JWT_SECRET=${newSecret}`;
    } else {
      envLines.push(`JWT_SECRET=${newSecret}`);
    }
    updated = true;
  }

  // Write updated content if necessary
  if (updated) {
    fs.writeFileSync(serverEnvPath, envLines.join('\n'));
    console.log('✅ Server .env file updated');
  }
}

// Check and create client .env
const clientEnvVars = {
  REACT_APP_API_URL: 'http://localhost:5000',
  REACT_APP_GOOGLE_CLIENT_ID: requiredEnvVars.GOOGLE_CLIENT_ID
};

if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = Object.entries(clientEnvVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Client .env file created');
}

console.log('Environment setup complete. Please restart both server and client.'); 