import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ApiError from './ApiError';
import httpStatus from 'http-status';
import config from '../config/config';
dotenv.config();

export const sendEmails = (
  email: string,
  studentId: string,
  type: string,
  password: string,
  activationToken: any
) => {
  try {
    const token = activationToken.activate.token;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.adminEmail,
        pass: config.email.adminEmailToken
      }
    });
    const mailOptions = {
      from: config.email.adminEmail,
      to: email,
      subject: 'Invitation to Assign IT',
      html: `<div>
              <div style="background-color:#363143;text-align:center;">
              <img slt="logo" src="https://res.cloudinary.com/dmxs2lcjz/image/upload/v1686732405/logo_aeer02.png"/>
              </div>
              <div style="text-align:center;">
              <img slt="logo" src="https://res.cloudinary.com/dmxs2lcjz/image/upload/v1686732387/cuate_jz9wxp.png"/>
              </div>
              <div style="margin-left:5rem;margin-bottom:5rem">
              <h4 style="margin-bottom:8px;color:#000000;">Hi there!</h4>
              <p style="color:#000000;">We are excited to welcome you to our online platform! You have been added as a ${type}.
              Below is your password and ${type} id. Click on the claim button to get started.</p>
              <ul>
              <li style="color:#363143;">Generated password: ${password} <a href='${config.frontendUrl}login' style="color:##5D34EC;text-decoration: none; font-size: 20px;">Login</a></li>
              <li style="color:#363143;"> ${type} ID is ${studentId}.</li>
              </ul>
              <h4>Best regards,</h4>
              </div>
              <table width="100%" height="100%" style="display:table">
              <tr>
              <td style="text-align:center; vertical-align: middle;">
              <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC; margin: auto;">
                  <a href='${config.frontendUrl}activate/${token}' style="color:#FFFFFF;text-decoration: none;font-size: 20px;display:block; text-align: center; line-height: 40px;">Claim Account</a>
               </div>
              </td>
              </tr>
             </table>
          </div>
        `
    };
    transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error while sending email, contact admin for support'
    );
  }
};
