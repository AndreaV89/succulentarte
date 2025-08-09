import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";
import  cors from "cors";

// Inizializza il gestore CORS per permettere le richieste dal tuo sito
const corsHandler = cors({origin: true});

export const sendContactMail = functions.https.onRequest((req, res) => {
  // Applica il gestore CORS a OGNI richiesta che arriva.
  // Questo risolve il problema del "preflight request".
  corsHandler(req, res, async () => {
    // Il resto del codice rimane quasi identico
    try {
      const gmailEmail = functions.config().gmail.email;
      const gmailPassword = functions.config().gmail.password;

      if (!gmailEmail || !gmailPassword) {
        console.error("Credenziali Gmail non configurate.");
        res.status(500).send("Errore di configurazione del server.");
        return;
      }

      const mailTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailEmail,
          pass: gmailPassword,
        },
      });

      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const {nome, email, messaggio} = req.body;

      if (!nome || !email || !messaggio) {
        res.status(400).send("Dati mancanti.");
        return;
      }

      const mailOptions = {
        from: `"${nome}" <${gmailEmail}>`,
        to: gmailEmail,
        subject: `Nuovo messaggio da ${nome} su SucculentArte`,
        html: `
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Messaggio:</strong></p>
          <p>${messaggio}</p>
        `,
      };

      await mailTransport.sendMail(mailOptions);
      console.log("Email inviata con successo a:", gmailEmail);
      res.status(200).send("Messaggio inviato con successo!");
    } catch (error) {
      console.error("Errore nell'invio dell'email:", error);
      res.status(500).send("Errore interno del server.");
    }
  });
});
