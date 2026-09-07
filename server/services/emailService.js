const sendgrid = require('@sendgrid/mail');

const getConfigurationError = () => {
  if (!process.env.SENDGRID_API_KEY) return 'SENDGRID_API_KEY is missing';
  if (!process.env.ADMIN_EMAIL) return 'ADMIN_EMAIL is missing';
  if (!process.env.SENDGRID_FROM_EMAIL) return 'SENDGRID_FROM_EMAIL is missing';
  return null;
};

const formatDate = (date, language) => new Date(date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// const buildMessages = (booking, type) => {
//   const hindi = booking.language === 'hi';
//   const date = formatDate(booking.date, booking.language);
//   const details = hindi
//     ? `सेवा: ${booking.serviceType}\nतारीख: ${date}\nग्राहक: ${booking.name}`
//     : `Service: ${booking.serviceType}\nDate: ${date}\nCustomer: ${booking.name}`;

//   if (type === 'created') {
//     return {
//       client: {
//         subject: hindi ? 'आपकी बुकिंग प्राप्त हो गई है' : 'Your booking has been received',
//         text: hindi ? `नमस्ते ${booking.name},\n\nआपकी सेवा बुकिंग प्राप्त हो गई है। हमारी टीम जल्द ही आपसे संपर्क करेगी।\n\n${details}` : `Hello ${booking.name},\n\nYour service booking has been received. Our team will contact you shortly.\n\n${details}`,
//       },
//       admin: {
//         subject: `New booking: ${booking.serviceType}`,
//         text: `A new booking was created.\n\n${details}\nEmail: ${booking.email}\nPhone: ${booking.phone}`,
//       },
//     };
//   }

//   return {
//     client: {
//       subject: hindi ? 'आपकी सेवा पूरी हो गई है' : 'Your service has been completed',
//       text: hindi ? `नमस्ते ${booking.name},\n\nआपकी सेवा पूरी हो गई है। Gulab Enterprises चुनने के लिए धन्यवाद।\n\n${details}` : `Hello ${booking.name},\n\nYour service has been completed. Thank you for choosing Gulab Enterprises.\n\n${details}`,
//     },
//     admin: {
//       subject: `Booking completed: ${booking.serviceType}`,
//       text: `A booking was marked completed.\n\n${details}\nCustomer email: ${booking.email}`,
//     },
//   };
// };

const buildMessages = (booking, type) => {
  const date = formatDate(booking.date, booking.language);

  //  CREATED
  if (type === 'created') {
    return {
      client: {
  subject: "Booking Confirmed | Gulab Enterprises",

  text: `
Hello ${booking.name},

Thank you for choosing Gulab Enterprises.

Your booking has been successfully confirmed.

Service: ${booking.serviceType}
Date: ${date}

Our team will contact you shortly.

Regards,
Gulab Enterprises Team

This is an automated message. Please do not reply.
  `,

  html: `
    <div style="font-family:Arial;padding:20px">
      <h2 style="color:#2563eb;">Booking Confirmed ✅</h2>

      <p>Hello <b>${booking.name}</b>,</p>

      <p>Thank you for choosing <b>Gulab Enterprises</b>.</p>

      <p>Your booking has been successfully confirmed.</p>

      <h3>📌 Booking Details:</h3>
      <ul>
        <li><b>Service:</b> ${booking.serviceType}</li>
        <li><b>Date:</b> ${date}</li>
      </ul>

      <p>Our team will contact you shortly.</p>

      <br/>

      <p>Regards,<br/><b>Gulab Enterprises Team</b></p>

      <hr/>
      <small style="color:gray;">
        This is an automated message. Please do not reply.
      </small>
    </div>
  `
},
  //     admin: {
  //       subject: `New Booking Received`,
  //       text: `New booking from ${booking.name}`,
  //       html: `
  //         <h2>New Booking 📩</h2>
  //         <p><b>Customer:</b> ${booking.name}</p>
  //         <p><b>Service:</b> ${booking.serviceType}</p>
  //         <p><b>Date:</b> ${date}</p>
  //       `
  //     }

  admin: {
  subject: `📥 New Booking Alert - Gulab Enterprises`,
  text: `
Hello Admin,

You have received a new booking.

Customer Details:
- Name: ${booking.name}
- Service: ${booking.serviceType}
- Date: ${date}
- Email: ${booking.email}
- Phone: ${booking.phone}

Please login to admin panel for more details.

Regards,
Gulab Enterprises System
  `,
  html: `
    <div style="font-family:Arial;padding:20px">
      <h2>📥 New Booking Alert</h2>
      <p>Hello Admin,</p>
      <p>A new booking has been received.</p>

      <ul>
        <li><b>Name:</b> ${booking.name}</li>
        <li><b>Service:</b> ${booking.serviceType}</li>
        <li><b>Date:</b> ${date}</li>
        <li><b>Email:</b> ${booking.email}</li>
        <li><b>Phone:</b> ${booking.phone}</li>
      </ul>

      <p>Please check your admin panel.</p>

      <hr/>
      <small>This is an internal notification email.</small>
    </div>
  `
}
    };
   }

  // ✅ COMPLETED
  if (type === 'completed') {
    const reviewUrl = `${process.env.CLIENT_URL}/reviews?bookingId=${booking._id}`;
    return {
      client: {
        subject: "Service Completed | Please Rate Us ⭐",
        text: `Hello ${booking.name},

Your ${booking.serviceType} service has been successfully completed.

Please rate your experience by visiting this link:
${reviewUrl}

Thank you for choosing Gulab Enterprises.`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;line-height:1.6">
          <h2 style="color:#16a34a">Service Completed 🎉</h2>
          <p>Hello <strong>${booking.name}</strong>,</p>
          <p>Your service has been successfully completed.</p>
          <p><b>Service:</b> ${booking.serviceType}</p>
          <p>We would love to hear about your experience.</p>
          <p><a href="${reviewUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">⭐ Rate Your Experience</a></p>
          <p>Thank you for choosing Gulab Enterprises.</p>
          </div>
        `
      },
      admin: {
        subject: `Booking Completed`,
        text: `Service completed for ${booking.name}`,
        html: `
          <h2>Service Completed ✅</h2>
          <p><b>Customer:</b> ${booking.name}</p>
          <p><b>Service:</b> ${booking.serviceType}</p>
        `
      }
    };
  }
};
// const send = async (recipient, message) => {
//   if (!recipient) return;
//   console.log("FROM:", process.env.SENDGRID_FROM_EMAIL);
//   await sendgrid.send({
//     to: recipient,
//     from: process.env.SENDGRID_FROM_EMAIL,
//     subject: message.subject,
//     text: message.text,
//   });
// };

const send = async (recipient, message) => {
  if (!recipient) return;

  //console.log("FROM:", process.env.SENDGRID_FROM_EMAIL);

  await sendgrid.send({
    to: recipient,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: "Gulab Enterprises" // 👈 BRAND NAME add karo
    },
    subject: message.subject,
    text: message.text,
    html: message.html, // 👈 IMPORTANT
  });
};

const sendBookingNotifications = async (booking, type) => {
  const configurationError = getConfigurationError();
  if (configurationError) {
    console.warn(`SendGrid notifications skipped: ${configurationError}.`);
    return;
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  const messages = buildMessages(booking, type);
  const results = await Promise.allSettled([
    send(booking.email, messages.client),
    send(process.env.ADMIN_EMAIL, messages.admin),
  ]);
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) {
    const messages = failed.map((result) => {
      const error = result.reason;
      const providerErrors = error.response?.body?.errors?.map((item) => item.message).join(', ');
      if (error.code === 403 || error.response?.statusCode === 403) {
        return `${providerErrors || 'Forbidden'}. Verify SENDGRID_FROM_EMAIL in SendGrid Sender Authentication and ensure the API key has Mail Send permission`;
      }
      return providerErrors || error.message;
    });
    throw new Error(`SendGrid notification failure: ${messages.join('; ')}`);
  }
};

const sendBookingCreatedNotifications = (booking) => sendBookingNotifications(booking, 'created');
const sendBookingCompletedNotifications = (booking) => sendBookingNotifications(booking, 'completed');

const sendPasswordResetEmail = async (recipient, resetUrl) => {
  const configurationError = getConfigurationError();
  if (configurationError) {
    throw new Error(`SendGrid password reset email unavailable: ${configurationError}`);
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  await send(recipient, {
    subject: 'Reset Your Gulab Enterprises Password',
    text: `You requested a password reset for your Gulab Enterprises account. Use this link within 30 minutes to set a new password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;padding:20px;line-height:1.6"><h2 style="color:#2563eb">Reset Your Password</h2><p>Use the button below within 30 minutes to set a new password for your Gulab Enterprises account.</p><p><a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
  });
};

const sendVerificationOtpEmail = async (recipient, otp) => {
  const configurationError = getConfigurationError();
  if (configurationError) {
    throw new Error(`SendGrid verification OTP unavailable: ${configurationError}`);
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  await send(recipient, {
    subject: 'Your Gulab Enterprises Verification Code',
    text: `Your Gulab Enterprises verification code is ${otp}. It expires in 10 minutes. If you did not create this account, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;padding:20px;line-height:1.6"><h2 style="color:#2563eb">Verify Your Email</h2><p>Your verification code is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes. If you did not create this account, you can ignore this email.</p></div>`,
  });
};

module.exports = { sendBookingCreatedNotifications, sendBookingCompletedNotifications, sendPasswordResetEmail, sendVerificationOtpEmail };