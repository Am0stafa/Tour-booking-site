//! email handler function to be used accros the application
const nodemailer = require('nodemailer');
//! to be able to send email we have 3 steps:

const sendMail = async (options) =>{
    //? 1)Create the transporter
    let transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    //? 2)Define the email options
    const mailOptions = {
        //^ where the email is comming from and the mail adderss
        from:'Abdo mostafa <a.abdo.mae@gmail.com>',
        //^ the resiveing address which will come as an arrugment of the function
        to:options.email,
        subject:options.subject,
        //^ the text version of the mail
        text:options.message,
        //^ convert this message to html
        //html:
    }
    

    //? 3)Send the mail
    await transporter.sendMail(mailOptions)

}

module.exports = sendMail;