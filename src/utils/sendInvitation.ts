import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ApiError from './ApiError';
import httpStatus from 'http-status';
dotenv.config();

export const sendEmails = (
  email: string,
  studentId: string,
  type: string,
  password: string,
  activationToken: any
) => {
  const token = activationToken.activate.token;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_TOKEN
    }
  });

  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Invitation to Assign IT',
      html: `<div>
              <div style="background-color:#363143;text-align:center;">
              <img slt="logo" src="https://res.cloudinary.com/duhetxdbs/image/upload/v1684855276/Black_and_White_Collection_15_o6fcr8.png"/>
              <h2 style="color:#FFFFFF;">Assign IT</h2>
              </div>
              <h4 style="margin-bottom:8px;color:#000000;">Hi there!</h4>
              <p style="color:#000000;">We are excited to welcome you to our online platform! You have been added as a ${type}.
              Below is your password and ${type} id. Click on the claim button to get started.</p>
              <ul>
              <li style="color:#363143;">Generated password: ${password} <a href='${process.env.BASE_URL}/api/auth/activate/:${token}' style="color:##5D34EC;text-decoration: none; font-size: 20px;">Login</a></li>
              <li style="color:#363143;"> ${type} ID is ${studentId}.</li>
              </ul>
              <h4>Best regards,</h4>
              <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC;text-align: center;">
              <a href='${process.env.BASE_URL}/api/auth/activate/:${token}' style="color:#FFFFFF;text-decoration: none; font-size: 20px;">Claim Account</a>
              </div>
          </div>
        `
    };
    transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error while sending email, contact for support'
    );
  }
};
