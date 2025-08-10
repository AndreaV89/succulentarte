
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from "nodemailer";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Migliore gestione dei CORS per permettere richieste solo dal tuo dominio
  response.setHeader('Access-Control-Allow-Origin', 'https://www.succulentarte.com');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    // Rispondi solo a richieste POST
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nome, email, messaggio } = request.body;

  if (!nome || !email || !messaggio) {
    return response.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
  }

  const { ARUBA_EMAIL, ARUBA_PASSWORD, TO_EMAIL } = process.env;

  if (!ARUBA_EMAIL || !ARUBA_PASSWORD || !TO_EMAIL) {
    console.error("Errore: Variabili d'ambiente non configurate correttamente.");
    return response.status(500).json({ message: 'Errore di configurazione del server.' });
  }

  const transporter = nodemailer.createTransport({
    host: "smtps.aruba.it", // Modificato in smtps.aruba.it
    port: 465,
    secure: true,
    auth: {
      user: ARUBA_EMAIL,
      pass: ARUBA_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });

 try {
    await transporter.sendMail({
      from: `"${nome}" <${ARUBA_EMAIL}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Nuovo messaggio da ${nome} su SucculentArte`,
      html: `<p><strong>Nome:</strong> ${nome}</p><p><strong>Email:</strong> ${email}</p><p><strong>Messaggio:</strong></p><p>${messaggio.replace(/\n/g, '<br>')}</p>`,
    });

    return response.status(200).json({ message: 'Messaggio inviato con successo!' });
  } catch (error) {
    console.error("ERRORE NODEMAILER:", error);
    return response.status(500).json({ message: 'Errore durante l\'invio dell\'email.' });
  }
}
