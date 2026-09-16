// Escape user-supplied values before interpolating them into email HTML.
// Prevents email-injection / HTML-injection when an HR types a job title or
// description containing markup.
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Format an ISO timestamp as a local date-time string (email-safe).
const formatTime = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

// Function to generate coding test email template
exports.generateTestEmailTemplate = ({
  name,
  email,
  description,
  jobTitle,
  startTime,
  endTime,
  testLink,
}) => {
  return {
    subject: `Coding Test Invitation for ${jobTitle}`,
    html: `
      <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
      <p>You have been selected for the coding test for <strong>${escapeHtml(jobTitle)}</strong>.</p>
      ${email ? `<p><strong>Candidate Email:</strong> ${escapeHtml(email)}</p>` : ""}
      <p>${escapeHtml(description)}</p>
      <p><strong>Test Window:</strong> ${formatTime(startTime)} - ${formatTime(endTime)}</p>
      <p>You can access your test using the link below:</p>
      <p><a href="${testLink}" style="color: #1a73e8; font-weight: bold;">Start Test</a></p>
      <br/>
      <p>Best regards,<br/>The Hiring Team</p>
    `,
  };
};

