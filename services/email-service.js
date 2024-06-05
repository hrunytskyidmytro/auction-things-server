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
                background: linear-gradient(to right, #ff7e5f, #feb47b);
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
                background: linear-gradient(to bottom, white, lightblue);
                border-radius: 10px;
                box-shadow: 1px 2px 15px 2px rgba(0, 0, 0, 0.2); 
                padding: 20px;
                text-align: center;
                border: 1px solid grey;
            }
            .logo {
                width: 300px;
                height: 300px;
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
            <img src="http://localhost:3000/logo.png" alt="Auction Bid&Win Logo" class="logo">
            
            <h1 class="heading">Аукціон речей Bid&Win</h1>

            <div class="content">
                ${text}
                <p>Детальніше про наш сайт: http://localhost:3000/</p>
            </div>
        </div>
    </body>
    </html>`;

    const htmlContent = htmlTemplate.replace("%content%", text);

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("Не вдалося надіслати електронного листа:", error);
    }
  }
}

module.exports = new EmailService();
