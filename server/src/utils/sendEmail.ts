import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
      user: "fd7ep2axctc2qmv4@ethereal.email",
      pass: "rFgvzEy6rnhZhapuAR",
    },
  });

  try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
  } catch (err) {
    console.error("Verification failed:", err);
  }

  try {
    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>', // sender address
      to, // list of recipients
      subject: "Change password", // subject line
      html, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}
