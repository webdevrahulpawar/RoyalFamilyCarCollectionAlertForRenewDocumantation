const { Resend } = require("resend");

const { env } = require("../startup");

let resendClient = null;

function getResendClient() {
  if (resendClient) return resendClient;
  resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

async function sendExpiryEmail({ to, subject, html }) {
  if (!env.emailEnabled) throw new Error("Email channel is not configured");

  console.log('[sendExpiryEmail] sending to:', to);

  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    }

    console.log('[sendExpiryEmail] sent successfully, id:', result.data?.id);
    return result;
  } catch (err) {
    console.error('[sendExpiryEmail] error:', err.message);
    throw err;
  }
}

module.exports = { sendExpiryEmail };

