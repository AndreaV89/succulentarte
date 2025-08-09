// functions/src/index.ts

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";
import  cors from "cors";

const corsHandler = cors({ origin: true });

// Definiamo le nostre variabili d'ambiente
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

export const sendcontactmail = onRequest({ secrets: ["GMAIL_EMAIL", "GMAIL_PASSWORD"] }, (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (!GMAIL_EMAIL || !GMAIL_PASSWORD) {
        logger.error("Le credenziali Gmail non sono configurate come variabili d'ambiente.");
        res.status(500).json({ message: "Errore di configurazione del server." });
        return;
      }
      
      if (req.method !== "POST") {
        res.status(204).send();
        return;
      }

      const { nome, email, messaggio } = req.body;
      if (!nome || !email || !messaggio) {
        res.status(400).json({ message: "Dati mancanti." });
        return;
      }

      const mailTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: GMAIL_EMAIL,
          pass: GMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"${nome}" <${GMAIL_EMAIL}>`,
        to: GMAIL_EMAIL,
        subject: `Nuovo messaggio da ${nome} su SucculentArte`,
        html: `
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Messaggio:</strong></p>
          <p>${messaggio}</p>
        `,
      };

      await mailTransport.sendMail(mailOptions);
      logger.info("Email inviata con successo a:", GMAIL_EMAIL);
      res.status(200).json({ message: "Messaggio inviato con successo!" });

    } catch (error) {
      logger.error("Errore critico nella funzione:", error);
      res.status(500).json({ message: "Errore interno del server." });
    }
  });
});