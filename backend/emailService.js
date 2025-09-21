const nodemailer = require('nodemailer');
const config = require('./config');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Bienvenue sur BabySip ! 👶',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366F1;">Bienvenue sur BabySip ! 👶</h2>
          <p>Bonjour <strong>${username}</strong>,</p>
          <p>Votre compte BabySip a été créé avec succès !</p>
          <p>Vous pouvez maintenant suivre les biberons et les couches de votre bébé facilement.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #6366F1; margin-top: 0;">Fonctionnalités disponibles :</h3>
            <ul>
              <li>🍼 Suivi des biberons</li>
              <li>💩 Suivi des couches</li>
              <li>📊 Statistiques quotidiennes</li>
              <li>⚙️ Paramètres personnalisables</li>
            </ul>
          </div>
          <p>Merci d'utiliser BabySip !</p>
          <p style="color: #666; font-size: 14px;">L'équipe BabySip</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

// Send reset code email
const sendResetCode = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Code de réinitialisation BabySip 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366F1;">Code de réinitialisation 🔐</h2>
          <p>Vous avez demandé une réinitialisation de votre mot de passe BabySip.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #6366F1; margin-top: 0;">Votre code de réinitialisation :</h3>
            <div style="font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #e74c3c; font-weight: bold;">⏰ Ce code expire dans 10 minutes</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Important :</h4>
            <ul style="color: #856404;">
              <li>Ce code est valide une seule fois</li>
              <li>Il expire dans 10 minutes</li>
              <li>Ne partagez jamais ce code</li>
            </ul>
          </div>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <p style="color: #666; font-size: 14px;">L'équipe BabySip</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset code email sent to ${email}: ${code}`);
  } catch (error) {
    console.error('❌ Error sending reset code email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetCode
};
