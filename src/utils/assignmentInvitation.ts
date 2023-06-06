import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ApiError from './ApiError';
import httpStatus from 'http-status';
import { Student } from '@prisma/client';
dotenv.config();

export const sendAssignmentInvitation = (
  students: Student[],
  assignment:any
) => {
  try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_TOKEN
    }
  });
  
  const studentsData = students.map((student) => student.user);
    for(let i=0;i<studentsData.length;i++ ){
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: studentsData[i].email,
            subject: 'Invitation to Assign IT',
            html: `<div>
                    <div style="background-color:#363143;text-align:center;">
                    <img slt="logo" src="https://res.cloudinary.com/duhetxdbs/image/upload/v1684855276/Black_and_White_Collection_15_o6fcr8.png"/>
                    <h2 style="color:#FFFFFF;">Assign IT</h2>
                    </div>
                    <h4 style="margin-bottom:8px;color:#000000;">Hi there ${studentsData[i].firstname} ${studentsData[i].lastname}!</h4>
                    <p style="color:#000000;">You have been invited to partake in this assignment, ${assignment.title} before ${assignment.deadline}. Use this ${assignment.assignmentCode} to submit your assignment.</p>
                    <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC;text-align: center;">
                    <a href='${process.env.BASE_URL}/api/assignment' style="color:#FFFFFF;text-decoration: none; font-size: 20px;">View Assignment</a>
                    </div>
                </div>
              `
          };
          transporter.sendMail(mailOptions);
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error while sending email, contact admin for support'
    );
  }
};