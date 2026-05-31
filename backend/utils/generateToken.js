import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key_12345';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    secret,
    {
      expiresIn
    }
  );
};

export default generateToken;
