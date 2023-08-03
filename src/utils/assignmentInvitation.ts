import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ApiError from './ApiError';
import httpStatus from 'http-status';
import { Assignment, Student, User } from '@prisma/client';
import prisma from '../client';
import config from '../config/config';
import { GetSubmission } from '../services/submission.service';
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

export const submissionNotification = async (user: User, submission: GetSubmission[]) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.adminEmail,
        pass: config.email.adminEmailToken
      }
    });

    let html = ``;

    for (let i = 0; i < submission.length; i++) {
      html =
        html +
        `
      <div style="margin-left:0rem;margin-bottom:2rem">
      <p style="margin-bottom:8px;color:#000000;">
       Student Name:  ${submission[i].student.user.firstname}  ${submission[i].student.user.lastname}<br>
       Student ID: ${submission[i].student.studentId} <br>
       Assignment Title:  ${submission[i].assignment.title}
      </p>
      `;
    }

    const mailOptions = {
      from: config.email.adminEmail,
      to: user.email,
      subject: 'New submission on your assignment',
      html: `<div>
      <div style="background-color:#363143;text-align:center;">
      <img slt="logo" src="https://res.cloudinary.com/dmxs2lcjz/image/upload/v1686732405/logo_aeer02.png"/>
      </div>

      <div style="margin-left:3rem;margin-bottom:3rem">
      <h4 style="margin-bottom:8px;color:#000000;">Dear  ${user.firstname} ${user.lastname},</h4>
      <p style="color:#000000;">We would like to invite to review and evaluate recent assignment submissions made by some of our students.</p>
      </div>

      ${html}

      <div style="margin-left:0rem;margin-bottom:3rem">
      <p style="color:#000000;">To access student's submissions, Please click on the button below.</p>
      </div>
      <table width="100%" height="100%" style="display:table">
          <tr>
          <td style="text-align:center; vertical-align: middle;">
          <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC; margin: auto;">
              <a href='${config.frontendUrl}assr/lecturer/submissions' style="color:#FFFFFF;text-decoration: none;font-size: 20px;display:block; text-align: center; line-height: 40px;">View submisssions</a>
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

export const sendSubmissionConfirmation = async (
  studentName: string,
  studentEmail: string,
  assignmentTitle: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.adminEmail,
        pass: config.email.adminEmailToken
      }
    });

    const mailOptions = {
      from: config.email.adminEmail,
      to: studentEmail,
      subject: 'Invitation to Assign IT',
      html: `<div>
          <div style="background-color:#363143;text-align:center;">
          <img slt="logo" src="https://res.cloudinary.com/dmxs2lcjz/image/upload/v1686732405/logo_aeer02.png"/>
          </div>
          <div style="margin-left:5rem;margin-bottom:5rem">
          <h4 style="margin-bottom:8px;color:#000000;">Dear ${studentName} ,</h4>
          <p style="color:#000000;">You have successfully submitted assignment "${assignmentTitle}".</p>
          </div>
        </div>`
    };

    transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error while sending email, contact admin for support'
    );
  }
};
