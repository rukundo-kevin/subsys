import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ApiError from './ApiError';
import httpStatus from 'http-status';
import { Assignment, Student } from '@prisma/client';
import prisma from '../client';
import config from '../config/config';
dotenv.config();

export const sendAssignmentInvitation = async (students: Student[], assignment: Assignment) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.adminEmail,
        pass: config.email.adminEmailToken
      }
    });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const user = await prisma.user.findFirst({ where: { id: student.userId } });

      if (user) {
        const mailOptions = {
          from: config.email.adminEmail,
          to: user.email,
          subject: 'Invitation to Assign IT',
          html: `<div>
          <div style="background-color:#363143;text-align:center;">
          <img slt="logo" src="https://res.cloudinary.com/dmxs2lcjz/image/upload/v1686732405/logo_aeer02.png"/>
          </div>
          <div style="text-align:center;">
              <img slt="logo" src="https://res.cloudinary.com/dmxs2lcjz/image/upload/v1686732387/cuate_jz9wxp.png"/>
          </div>
          <div style="margin-left:5rem;margin-bottom:5rem">
          <h4 style="margin-bottom:8px;color:#000000;">Hi there ${user.firstname} ${user.lastname}!</h4>
          <p style="color:#000000;">You have been invited to partake in this assignment, ${assignment.title} before ${assignment.deadline}. Use this ${assignment.assignmentCode} to submit your assignment.</p>
          </div>
          <table width="100%" height="100%" style="display:table">
              <tr>
              <td style="text-align:center; vertical-align: middle;">
              <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC; margin: auto;">
                  <a href='${config.frontendUrl}student/dashboard' style="color:#FFFFFF;text-decoration: none;font-size: 20px;display:block; text-align: center; line-height: 40px;">View assignment</a>
               </div>
              </td>
              </tr>
             </table>
        </div>`
        };

        transporter.sendMail(mailOptions);
      }
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error while sending email, contact admin for support'
    );
  }
};
