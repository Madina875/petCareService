const nodemailer = require("nodemailer");
const config = require("config");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("smtp_user"),
        pass: config.get("smtp_password"),
      },
    });
  }

  async sendMail(toEmail, link) {
    try {
      await this.transporter.sendMail({
        from: config.get("smtp_user"),
        to: toEmail,
        subject: "Akkauntni faollashtirish",
        text: `Assalomu alaykum!\n\nSizning akkauntingiz muvaffaqiyatli faollashtirildi. Endi siz xizmatlarimizdan to'liq foydalanishingiz mumkin.\n\nAgar bu siz bo'lmasangiz, iltimos biz bilan darhol bog'laning.\n\nKirish: ${link}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background-color:purple; color: white; padding: 20px; text-align: center;">
                <h1>🎉 Akkaunt Faollashtirildi!</h1>
              </div>
              <div style="padding: 30px; color: #333;">
                <p>Assalomu alaykum!</p>
                <p>Sizning akkauntingiz muvaffaqiyatli faollashtirildi. Endi siz xizmatlarimizdan to'liq foydalanishingiz mumkin.</p>
                <p>Agar bu siz bo'lmasangiz, iltimos biz bilan darhol bog'laning.</p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${link}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    👉 Kirish
                  </a>
                </div>
              </div>
              <div style="background-color: #f1f1f1; color: #555; text-align: center; padding: 15px; font-size: 12px;">
                RentOutItems jamoasi © ${new Date().getFullYear()}
              </div>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = new MailService();
