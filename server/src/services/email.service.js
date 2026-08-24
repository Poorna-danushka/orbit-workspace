const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
} = require('../config/env');

const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Boolean(SMTP_SECURE),
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

const buildProjectInvitationHtml = ({ projectName, inviterName, inviteUrl, invitedEmail, expiresAt }) => `
  <div style="font-family:Arial,Helvetica,sans-serif; background:#0b1020; padding:24px; color:#e5e7eb;">
    <div style="max-width:640px; margin:0 auto; background:#111827; border:1px solid rgba(168,85,247,0.35); border-radius:18px; overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed,#38bdf8); padding:24px 28px; color:white;">
        <h1 style="margin:0; font-size:28px;">Orbit</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 12px; font-size:16px; color:#d1d5db;">Hello,</p>
        <p style="margin:0 0 18px; font-size:16px; line-height:1.6; color:#e5e7eb;">
          <strong>${inviterName}</strong> has invited you to collaborate on <strong>${projectName}</strong>.
        </p>
        <p style="margin:0 0 20px; font-size:14px; color:#cbd5e1;">
          You are receiving this invitation for <strong>${invitedEmail}</strong>. To join the project, click the button below.
        </p>
        <div style="margin:0 0 20px; text-align:center;">
          <a href="${inviteUrl}" style="display:inline-block; background:#8b5cf6; color:#fff; text-decoration:none; padding:14px 22px; border-radius:10px; font-weight:700;">Join Project</a>
        </div>
        <p style="margin:0 0 8px; font-size:13px; color:#cbd5e1;">This invitation expires on: <strong>${new Date(expiresAt).toLocaleString()}</strong></p>
        <p style="margin:0; font-size:12px; color:#94a3b8; word-break:break-all;">If the button does not work, open this link manually: ${inviteUrl}</p>
      </div>
    </div>
  </div>
`;

const sendProjectInvitationEmail = async ({ to, projectName, inviterName, inviteUrl, invitedEmail, expiresAt }) => {
  if (!transporter) {
    throw new Error('SMTP email configuration is missing');
  }

  const subject = `${inviterName} invited you to join ${projectName} on Orbit`;
  const html = buildProjectInvitationHtml({ projectName, inviterName, inviteUrl, invitedEmail, expiresAt });
  const text = `You have been invited to join ${projectName} on Orbit.\n\nInvited by: ${inviterName}\n\nOpen this link to accept the invitation: ${inviteUrl}\n\nThis invitation expires on: ${new Date(expiresAt).toLocaleString()}`;

  return transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendProjectInvitationEmail,
};
