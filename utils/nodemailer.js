const nodemailer = require("nodemailer");

   module.exports =   async( to, subject, text)=>{
  let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: "465", 
  service:'gmail',
  auth: {
    user: 'gaikonedo@gmail.com',
    pass: 'ckiauefwqxwgzryx', 
  },
  tls:{
    rejectUnauthorized:false
}
});

transporter.sendMail({
  from : 'gaikonedo@gmail.com',
  to ,
  subject,
  text 
})
   }









