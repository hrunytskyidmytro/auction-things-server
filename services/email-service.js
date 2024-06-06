const nodemailer = require("nodemailer");

class EmailService {
  async sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
    });

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Аукціон речей Bid&Win</title>

       <style>
            body {
                background: #e8e8e8;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .card {
                width: 80%;
                max-width: 600px;
                background: linear-gradient(to bottom, #faf09b, lightblue);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                border: 0.5px solid #dee0dc;
            }
            .heading {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .content {
                font-size: 16px;
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="card">       
            <h1 class="heading">Аукціон речей Bid&Win</h1>

            <div class="content">
                ${text}
                <p>Детальніше на нашому сайті: http://localhost:3000/</p>
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      html: htmlTemplate,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("Не вдалося надіслати електронного листа:", error);
    }
  }
}

module.exports = new EmailService();
