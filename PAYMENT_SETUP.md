# Peternity - Payment & SMTP Setup Guide

This guide describes how to configure the production credentials for the **Nodemailer SMTP** and **Razorpay Payment Gateway** integrations.

---

## 📧 1. Nodemailer SMTP Setup

To configure the automatic order confirmation email system:

1. Open your Google Account settings, select **Security**, and search for **App Passwords**.
2. Generate a new App Password for "Mail". Google will give you a 16-character code.
3. Open your `.env` file and append the keys:
   ```env
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

*Note: In development, if these variables are absent, the server will gracefully log a styled HTML preview to the console.*

---

## 💳 2. Razorpay Payment Gateway Setup

To transition from the simulated **Developer Sandbox Mode** to live payment collection:

1. Create or log into your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Select **Settings** > **API Keys** and click **Generate Key**.
3. Save the values and add them to your `.env` file:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```

*Note: If these keys are not set, our system operates in a premium Glassmorphic Sandbox popup modal, enabling flawless testing.*
