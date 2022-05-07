//! email handler function to be used accros the application
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');


//& whenever we want to send a new email we import this email class and then use it like this:
    //^ new Email(user:which contain the email address and also the name ,url:such as the reset url for resting the password)
            //* .sendWelcome to send welcome message whenever the user signs up

module.exports = class Email{

    constructor(user,url){
        this.to = user.email
        this.firstName = user.split(' ')[0]
        this.url = url
        this.from = `Abdo mostafa <${process.env.EMAIL_FROM}>`
    }
    
    newTransport(){
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
              }
            });
          }
        
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        })
    }
    
    //! send the actual email
    async send(template,subject){
        //& 1) render HTML based on a pug template
            //? this will take in the file and then render the pug code into html
            const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject
            });
    
    
        //& 2) Define the email options
           const mailOptions = {
            //^ where the email is comming from and the mail adderss
            from: this.from,
            //^ the resiveing address which will come as an arrugment of the function
            to:this.to,
            subject,
            //^ the text version of the mail
            text:convert(html, {
                wordwrap: 130
              }),
            //^ convert this message to html
            html
        }
        
        //& 3) create a transport and send email
        this.newTransport().sendMail(mailOptions)
    }
    
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
      }
    
    async sendPasswordReset() {
        await this.send(
          'passwordReset',
          'Your password reset token (valid for only 10 minutes)'
        );
    }

}




//! to be able to send email we have 3 steps:
    //? 1)Create the transporter

    //? 2)Define the email options

    //? 3)Send the mail


