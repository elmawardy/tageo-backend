"use strict";
const nodemailer = require("nodemailer");
var fs = require('fs');
var handlebars = require('handlebars');

class Email {

  // async..await is not allowed in global scope, must use a wrapper
  static async sendMail(sender_name,to,subject,template,data) {

      this.readHTMLFile(`./views/email_templates/${template || 'default.html'}`,async function (err,html){
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "mawardytools@gmail.com", // generated ethereal user
          pass: "uDpHy7NNwG#J", // generated ethereal password
        },
      });

        
      var template = handlebars.compile(html);
      var htmlToSend = template(data);

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"${sender_name || 'Tageo'}" info@tageo.com`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        // text: "Hello world?", // plain text body
        html: htmlToSend, // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    })

  }

}

Email.readHTMLFile = function(path, callback) {
  fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err;
          callback(err);
      }
      else {
          callback(null, html);
      }
  });
}


module.exports = {Email};