const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'accounts@admivo.in',
    pass: 'eojv oywq zona smdm'
  }
});

const mailOptions = {
  from: `"PrintsByPaws" <${process.env.EMAIL_USER}>`,
  to: 'somilnema29@gmail.com, yuvrajsingh13@gmail.com',
  subject: 'Test Email - PrintsByPaws Credentials Verified!',
  html: `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Hello! 🐾</h2>
      <p>This is an automated test email to confirm that your new email credentials (<strong>accounts@admivo.in</strong>) are working perfectly in the PrintsByPaws system.</p>
      <p>All future order receipts and preview drafts will be sent using these credentials.</p>
      <p>Best,<br/>Antigravity AI</p>
    </div>
  `
};

console.log('Attempting to send email with user:', process.env.EMAIL_USER);

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email successfully sent! Response:', info.response);
  }
});
