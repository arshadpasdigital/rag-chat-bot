const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export const sendEmail =async (recivedEmail:string, otpCode:string)=>{
    try {
  const info = await transporter.sendMail({
    from: 'From Micro-Service App', // sender address
    to: recivedEmail, // list of recipients
    subject: "Verification delevery E-mail", // subject line
    text: `Hello use this code to verify your email address ${otpCode}`, // plain text body
    html: "<b>Hello world?</b>", // HTML body
  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}
}