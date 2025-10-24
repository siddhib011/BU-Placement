const sgMail = require('@sendgrid/mail');

// Set the API key for the SendGrid library
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  // Log the attempt
  console.log(`[sendEmail] Attempting to send email via SendGrid to: ${to} from ${process.env.SENDER_EMAIL}`);

  // Define the email message structure
  const msg = {
    to: to, // Recipient email address
    from: process.env.SENDER_EMAIL, // Your verified sender email address
    subject: subject, // Subject line
    text: text, // Plain text body
    // html: '<strong>Optional HTML content</strong>', // You can add HTML content here
  };

  try {
    // Attempt to send the email
    await sgMail.send(msg);
    console.log('✅ [sendEmail] Email sent successfully via SendGrid');
  } catch (error) {
    // Log detailed errors if sending fails
    console.error('!!! [sendEmail] Error sending email via SendGrid:', error);
    if (error.response) {
      // SendGrid often includes helpful details in the response body
      console.error('!!! [sendEmail] SendGrid Error Body:', error.response.body);
    }
  }
};

module.exports = sendEmail;