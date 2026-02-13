import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../email/sendEmail.utils.js";
import { template } from "../email/generateHTML.js";
export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName, emailSubject.confirmEmail),
  }).catch((error) => {
    console.log(`Error sending confirmation email: ${data.to}`, error);
  });
});

emailEvent.on("forgetPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, data.firstName, emailSubject.resetPassword),
  }).catch((error) => {
    console.log(`Error sending confirmation email: ${data.to}`, error);
  });
});
