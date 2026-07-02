const axios = require("axios");
const speakeasy = require("speakeasy");

// Brevo API Configuration
const BREVO_API_URL = "https://api.brevo.com/v3";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "DevFusion Cloud IDE";

// Generate OTP
const generateOTP = () => {
  return speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 20 }).base32,
    encoding: "base32",
    digits: 6,
  });
};

// Send OTP email using Brevo API
const sendOTPEmail = async (email, otp, username) => {
  try {
    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: {
          name: EMAIL_FROM_NAME,
          email: EMAIL_FROM,
        },
        to: [
          {
            email: email,
            name: username,
          },
        ],
        subject: "Verify Your DevFusion Account",
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f6f9fc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 40px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.05);
                border: 1px solid #e5e7eb;
              }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: 800; color: #1a1a1a; }
              .logo span { background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .otp-box { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
              .otp-code { font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace; }
              .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                padding: 12px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">DevFusion <span>Cloud IDE</span></div>
                <p style="color: #64748b; margin-top: 8px;">Verify your email address</p>
              </div>

              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                Hi <strong>${username}</strong>,
              </p>
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                Thanks for signing up for DevFusion Cloud IDE! Please use the code below to verify your email address.
              </p>

              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="color: #64748b; font-size: 14px; margin-top: 8px;">
                  This code will expire in 10 minutes
                </p>
              </div>

              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                Or click the button below to verify your account:
              </p>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.FRONTEND_URL}/verify?email=${encodeURIComponent(email)}&otp=${otp}" class="button">
                  Verify Email
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                If you didn't request this, please ignore this email.
              </p>

              <div class="footer">
                &copy; ${new Date().getFullYear()} DevFusion Cloud IDE. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    console.log("✅ OTP email sent to:", email);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error("❌ OTP email error:", error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Send verification success email using Brevo API
const sendVerificationSuccessEmail = async (email, username) => {
  try {
    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: {
          name: EMAIL_FROM_NAME,
          email: EMAIL_FROM,
        },
        to: [
          {
            email: email,
            name: username,
          },
        ],
        subject: "🎉 Welcome to DevFusion Cloud IDE!",
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to DevFusion</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: 800; color: #1a1a1a; }
              .logo span { background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .checkmark { font-size: 48px; text-align: center; }
              .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">DevFusion <span>Cloud IDE</span></div>
              </div>
              <div class="checkmark">✅</div>
              <h2 style="text-align: center; color: #1a1a1a;">Welcome to DevFusion, ${username}! 🎉</h2>
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; text-align: center;">
                Your email has been verified successfully. Start coding in the cloud today!
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Start Coding
                </a>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} DevFusion Cloud IDE. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    console.log("✅ Verification success email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ Verification success email error:", error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

module.exports = {
  sendOTPEmail,
  sendVerificationSuccessEmail,
  generateOTP,
};