<?php
// --- CONFIGURAZIONE ---
$destinatario = "a.vannetti08@gmail.com"; // <-- INSERISCI L'EMAIL DOVE VUOI RICEVERE I MESSAGGI
$sito_web = "https://www.succulentarte.com"; // <-- L'URL DEL TUO SITO VERCEL

// --- GESTIONE CORS ---
// Permette al tuo sito su Vercel di comunicare con questo script su Aruba
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] == $sito_web) {
    header("Access-Control-Allow-Origin: " . $sito_web);
} else {
    // Blocca richieste da origini non autorizzate
    http_response_code(403);
    exit;
}

header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Gestisce la richiesta "preflight" del browser per il CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- LOGICA DI INVIO ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Metodo non consentito']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$nome = filter_var(trim($data['nome'] ?? ''), FILTER_SANITIZE_STRING);
$email = filter_var(trim($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$messaggio = filter_var(trim($data['messaggio'] ?? ''), FILTER_SANITIZE_STRING);

if (empty($nome) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($messaggio)) {
    http_response_code(400);
    echo json_encode(['message' => 'Dati mancanti o non validi.']);
    exit;
}

$oggetto = "Nuovo messaggio da $nome su SucculentArte";
$corpo_email = "Nome: " . $nome . "\n";
$corpo_email .= "Email: " . $email . "\n\n";
$corpo_email .= "Messaggio:\n" . $messaggio . "\n";

// IMPORTANTE: Usa un'email del tuo dominio (es. no-reply@succulentarte.com)
// per evitare che i messaggi finiscano nello spam. Creala dal pannello di Aruba.
$headers = "From: info@succulentarte.com" . "\r\n" .
           "Reply-To: " . $email . "\r\n" .
           "X-Mailer: PHP/" . phpversion();

if (mail($destinatario, $oggetto, $corpo_email, $headers)) {
    http_response_code(200);
    echo json_encode(['message' => 'Messaggio inviato con successo!']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Errore del server, impossibile inviare il messaggio.']);
}
?>