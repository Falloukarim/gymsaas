export const connectAndPrint = async (gymName: string, ticket: any) => {
  try {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth non supporté par ce navigateur');
    }

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] 
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Connexion au serveur GATT échouée');

    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    const ticketContent = [
      `${gymName.toUpperCase()}`,
      '--------------------------',
      `Ticket #${ticket.id.slice(0, 8)}`,
      `Date: ${new Date(ticket.printed_at).toLocaleString()}`,
      `Type: ${ticket.session_type}`,
      `Prix: ${ticket.price} XOF`,
      '--------------------------',
      'Merci pour votre visite !'
    ].join('\n');

    // 3. Préparer les commandes ESC/POS
    const commands: number[] = [];

    // Initialisation
    commands.push(0x1B, 0x40); // Reset printer

    // Alignement centre
    commands.push(0x1B, 0x61, 0x01);

    // Texte en gras
    commands.push(0x1B, 0x45, 0x01);

    // Ajouter le texte (converti en tableau de nombres)
    const addText = (text: string) => {
      for (let i = 0; i < text.length; i++) {
        commands.push(text.charCodeAt(i));
      }
      commands.push(0x0A); // Nouvelle ligne après chaque texte
    };

    // Titre du gym (première ligne en gras et centrée)
    addText(gymName.toUpperCase());

    // Retour au style normal
    commands.push(0x1B, 0x45, 0x00);

    // Alignement gauche
    commands.push(0x1B, 0x61, 0x00);

    // Ajouter le reste du contenu du ticket
    const lines = ticketContent.split('\n').slice(1); // On saute la première ligne déjà ajoutée
    for (const line of lines) {
      addText(line);
    }

    // Couper le papier
    commands.push(0x1D, 0x56, 0x41, 0x03);

    // 4. Envoyer les données à l'imprimante
    const data = new Uint8Array(commands).buffer;
    await characteristic.writeValueWithoutResponse(data);

    alert('Ticket imprimé avec succès!');
  } catch (error) {
    console.error('Erreur d\'impression:', error);
    alert(`Erreur lors de l'impression: ${error instanceof Error ? error.message : String(error)}`);
  }
};