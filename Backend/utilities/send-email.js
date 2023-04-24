import nodemailer from "nodemailer";

const sendEmail = async (options, cred) => {

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: cred.user,
            pass: cred.pass
        }
    });

    const mailOptions = {
        from : cred.from,
        to: options.to,
        subject: options.subject,
        html: options.text
    };

    return await transporter.sendMail(mailOptions)
}

export default sendEmail