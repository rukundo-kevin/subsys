import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ApiError from './ApiError';
import httpStatus from 'http-status';
import { Student } from '@prisma/client';
import prisma from '../client';
import config from '../config/config';
dotenv.config();

export const sendAssignmentInvitation = async (students: Student[], assignment: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_TOKEN
      }
    });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const user = await prisma.user.findFirst({ where: { id: student.userId } });

      if (user) {
        const mailOptions = {
          from: process.env.ADMIN_EMAIL,
          to: user.email,
          subject: 'Invitation to Assign IT',
          html: `<div>
          <div style="background-color:#363143;text-align:center;">
            <img slt="logo" src="https://res.cloudinary.com/duhetxdbs/image/upload/v1684855276/Black_and_White_Collection_15_o6fcr8.png"/>
            <h2 style="color:#FFFFFF;">Assign IT</h2>
          </div>
          <h4 style="margin-bottom:8px;color:#000000;">Hi there ${user.firstname} ${user.lastname}!</h4>
          <p style="color:#000000;">You have been invited to partake in this assignment, ${assignment.title} before ${assignment.deadline}. Use this ${assignment.assignmentCode} to submit your assignment.</p>
          <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC;text-align: center;">
            <a href='${config.frontendUrl}student/dashboard' style="color:#FFFFFF;text-decoration: none; font-size: 20px;">View Assignment</a>
          </div>
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
