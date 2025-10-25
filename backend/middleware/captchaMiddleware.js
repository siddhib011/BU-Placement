const axios = require('axios');

const verifyCaptcha = async (req, res, next) => {
  // Get the reCAPTCHA token from the request body (Frontend will send this as 'recaptchaToken')
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA verification is required.' });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const response = await axios.post(verifyUrl);
    const data = response.data;

    if (data.success) {
      // reCAPTCHA verification passed! Proceed to the next middleware/controller.
      next();
    } else {
      console.warn("reCAPTCHA verification failed:", data['error-codes']);
      return res.status(401).json({ message: 'reCAPTCHA verification failed. Please try again.' });
    }
  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    return res.status(500).json({ message: 'Server error during CAPTCHA verification.' });
  }
};

module.exports = { verifyCaptcha };