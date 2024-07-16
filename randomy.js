const crypto = require('crypto');

// Function to generate a random string of specified length (digit only)
function generateRandomDigits(length)
{
  const chars = '0123456789';
  return internalGenerateRandomString(chars, length);
}

// Function to generate a random string of digits, letters (both cases), and symbols
function generateRandomString(length)
{
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?';
  return internalGenerateRandomString(chars, length);
}

// Internal function to generate random string based on characters and length
function internalGenerateRandomString(chars, length)
{
  let randomString = '';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++)
  {
    const randomIndex = crypto.randomInt(charsLength);
    randomString += chars[randomIndex];
  }
  return randomString;
}

module.exports = {
  generateRandomDigits,
  generateRandomString
};