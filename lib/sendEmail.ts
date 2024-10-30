// lib/sendEmail.ts

import nodemailer from "nodemailer";

export async function sendConfirmationEmail(to: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // Utilisez `true` si vous utilisez le port 465, sinon `false` pour le port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }); 

  const mailOptions = {
    from: `"Votre Nom" <${process.env.EMAIL_USER}>`, // Adresse d'expédition
    to, // Adresse de l'utilisateur qui recevra l'e-mail
    subject: "Confirmation de création de compte",
    text: "Votre compte a bien été créé. Bienvenue !",
    html: "<p>Votre compte a bien été créé. Bienvenue !</p>",
  };

  await transporter.sendMail(mailOptions);
}
