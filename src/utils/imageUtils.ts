/**
 * Genera gli URL per le diverse dimensioni di un'immagine basandosi sull'URL originale.
 * @param originalUrl L'URL dell'immagine originale caricata su Firebase Storage.
 * @returns Un oggetto con gli URL per thumbnail, medium e large, o null se l'URL non è valido.
 */
export const getResizedImageUrls = (originalUrl: string | undefined) => {
  if (!originalUrl) {
    return {
      thumbnail: "",
      medium: "",
      large: "",
      original: "",
    };
  }

  // Troviamo l'ultimo punto per inserire il suffisso della dimensione prima dell'estensione
  const lastDotIndex = originalUrl.lastIndexOf(".");
  // Troviamo l'inizio dei parametri di query (dopo il token)
  const queryIndex = originalUrl.indexOf("?");

  if (lastDotIndex === -1 || queryIndex === -1) {
    // URL non valido o senza estensione/token, restituiamo l'originale per sicurezza
    return {
      thumbnail: originalUrl,
      medium: originalUrl,
      large: originalUrl,
      original: originalUrl,
    };
  }

  const baseUrl = originalUrl.substring(0, lastDotIndex);
  const extension = originalUrl.substring(lastDotIndex, queryIndex);
  const queryParams = originalUrl.substring(queryIndex);

  return {
    thumbnail: `${baseUrl}_200x200${extension}${queryParams}`,
    medium: `${baseUrl}_800x800${extension}${queryParams}`,
    large: `${baseUrl}_1600x1600${extension}${queryParams}`,
    original: originalUrl,
  };
};