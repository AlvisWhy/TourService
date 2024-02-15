const nodemailer = require('nodemailer');

const endEmail = options=> {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 
        }
    })
}