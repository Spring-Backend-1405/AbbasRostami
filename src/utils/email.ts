import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Brevo HTTP API (Production) ─────────────────
const sendWithBrevo = async (params: EmailParams) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Course Shop",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(JSON.stringify(error));
  }
};

// ─── Gmail (Local) ───────────────────────────────
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
    if (process.env.BREVO_API_KEY) {
      await sendWithBrevo(params);
    } else {
      await sendWithGmail(params);
    }
    console.log(`📧 Email sent to ${params.to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
};
