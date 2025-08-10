// api/send-email.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Leggiamo le credenziali sicure dalle Variabili d'Ambiente di Vercel
const { GMAIL_EMAIL, GMAIL_PASSWORD, TO_EMAIL } = process.env;



module.exports = async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Imposta gli header per il CORS (permette al tuo sito di chiamare questa funzione)
  response.setHeader('Access-Control-Allow-Origin', 'https://www.succulentarte.com');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  console.log("ciao");
  
  // Gestisce la richiesta "preflight" del browser per il CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nome, email, messaggio } = request.body;

  if (!nome || !email || !messaggio) {
    return response.status(400).json({ message: 'Dati mancanti.' });
  }

  if (!GMAIL_EMAIL || !GMAIL_PASSWORD || !TO_EMAIL) {
    console.error("Variabili d'ambiente per l'invio email non configurate su Vercel.");
    return response.status(500).json({ message: 'Errore di configurazione del server.' });
  }

  // Configura il trasporto di Nodemailer con le credenziali
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_EMAIL,
      pass: GMAIL_PASSWORD, // La password per le app di 16 cifre
    },
  });

  try {
    await transporter.sendMail({
      from: `"${nome}" <${GMAIL_EMAIL}>`,
      to: TO_EMAIL, // L'email dove vuoi ricevere i messaggi
      replyTo: email,
      subject: `Nuovo messaggio da ${nome} su SucculentArte`,
      html: `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email del mittente:</strong> ${email}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${messaggio.replace(/\n/g, '<br>')}</p>
      `,
    });

    return response.status(200).json({ message: 'Messaggio inviato con successo!' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Errore durante l\'invio dell\'email.' });
  }
}