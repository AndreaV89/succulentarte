import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from "nodemailer";


export default async function handler(request: VercelRequest,
  response: VercelResponse,) {
      console.log("--- Funzione /api/send-email avviata ---");
  console.log("Metodo della richiesta:", request.method);

    const ARUBA_EMAIL = process.env.ARUBA_EMAIL;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
  const TO_EMAIL = process.env.TO_EMAIL;

    console.log("Variabile GMAIL_EMAIL trovata:", !!ARUBA_EMAIL);
  console.log("Variabile GMAIL_PASSWORD trovata:", EMAIL_PASSWORD ? 'Sì' : 'NO - MANCANTE!');
  console.log("Variabile TO_EMAIL trovata:", !!TO_EMAIL);

  response.setHeader('Access-Control-Allow-Origin', 'https://www.succulentarte.com');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    console.log("Rispondo a richiesta OPTIONS (preflight).");
    return response.status(200).end();

    
  }

    if (!ARUBA_EMAIL || !EMAIL_PASSWORD || !TO_EMAIL) {
    console.error("ERRORE FATALE: Una o più variabili d'ambiente per l'email non sono state trovate.");
    return response.status(500).json({ message: 'Errore critico di configurazione del server.' });
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

    const { nome, email, messaggio } = request.body;

     if (!nome || !email || !messaggio) {
    return response.status(400).json({ message: 'Dati mancanti nel corpo della richiesta.' });
  }


  const transporter = nodemailer.createTransport({
    host: "smtp.aruba.it",
    port: 465,
    secure: true,
    auth: {
      user: ARUBA_EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  try {
    console.log("Sto per inviare l'email...");
    await transporter.sendMail({
      from: `"${nome}" <${ARUBA_EMAIL}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Nuovo messaggio da ${nome} su SucculentArte`,
      html: `<p><strong>Nome:</strong> ${nome}</p><p><strong>Email:</strong> ${email}</p><p><strong>Messaggio:</strong></p><p>${messaggio.replace(/\n/g, '<br>')}</p>`,
    });

    console.log("Email inviata con successo.");
    return response.status(200).json({ message: 'Messaggio inviato con successo!' });
  } catch (error) {
    console.error("ERRORE NODEMAILER:", error);
    return response.status(500).json({ message: 'Errore durante l\'invio dell\'email.' });
  }
}
