import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Production: Resend API ─────────────────────
const sendWithResend = async (params: EmailParams) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Course Shop <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(JSON.stringify(error));
  }
};

// ─── Local: Gmail ───────────────────────────────
const sendWithGmail = async (params: EmailParams) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Course Shop" <${process.env.EMAIL_USER}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
};

// ─── Auto-select ────────────────────────────────
export const sendEmail = async (params: EmailParams) => {
  try {
    if (process.env.RESEND_API_KEY) {
      await sendWithResend(params);
    } else {
      await sendWithGmail(params);
    }
    console.log(`📧 Email sent to ${params.to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
};