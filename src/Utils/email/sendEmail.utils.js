import nodemailer from "nodemailer";

export async function sendEmail({
  to = "",
  cc = "",
  bcc = "",
  text = "",
  html = "",
  subject = "Sara7a Application",
  attachments = [],
} = {}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Route Academy ✌️" <${process.env.EMAIL}>`,
    to,
    cc,
    bcc,
    text,
    html,
    subject,
    attachments,
  });
}

export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  welcome: "Welcome to Route Academy",
  contactUs: "Contact Us",
};
