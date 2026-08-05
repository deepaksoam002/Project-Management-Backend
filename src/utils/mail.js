import Mailgen from "mailgen"
import nodeMailer from "nodemailer"


const sendEmail = async (options) => {
 
    const mailGenerator = new Mailgen({

        theme: "default",
        product: {

            name: "Project Management",
            link: "https://projectmanagement.com"
        }
    });


    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);  // email text form if client not support html body

    const emailHTML = mailGenerator.generate(options.mailGenContent);


    const transporter = nodeMailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });


    const mail = {
        to: "projectmanagement@example.com",
        from: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML
    };


    try {
        
           await transporter.sendMail(mail)

    } catch (error) {

        console.error(" Email service failed silently. Make sure that you have provided MAILTRAP credentials in the .env file")
        console.error("Error:", error)
        
    }



}


const emailVerificationMailContent = (username, verificationURL) => {
    return {
        body:{

            name: username,
            intro: 'Welcome to project_management We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify your email, please click here:',
                button: {
                   color: '#22BC66', // Optional action button color
                   text: 'Confirm your account',
                   link: verificationURL
               }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
        }
 }

const forgotPasswordMailContent = (username, passwordResetURL) => {
    return {
        body:{

            name: username,
            intro: 'You have received this email because a password reset request for your Project_Management account was received.',
            action: {
                instructions: 'Click the button below to reset your password:',
                button: {
                   color: '#f16d20d7', // Optional action button color
                   text: 'Reset Password',
                   link: passwordResetURL
               }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
        }
 }


 export { 
    emailVerificationMailContent,
    forgotPasswordMailContent,
    sendEmail
 }