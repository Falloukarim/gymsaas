// Configuration type
type PrinterConfig = {
  serviceUUID: string;
  characteristicUUID: string;
};

// Default config (peut être override par setPrinterConfig)
let printerConfig: PrinterConfig = {
  serviceUUID: process.env.NEXT_PUBLIC_PRINTER_SERVICE_UUID || '000018f0-0000-1000-8000-00805f9b34fb',
  characteristicUUID: process.env.NEXT_PUBLIC_PRINTER_CHARACTERISTIC_UUID || '00002af1-0000-1000-8000-00805f9b34fb'
};


// State variables
let connectedDevice: BluetoothDevice | null = null;
let connectedServer: BluetoothRemoteGATTServer | null = null;
let connectedCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

// Config setter
export const setPrinterConfig = (config: Partial<PrinterConfig>) => {
  printerConfig = { ...printerConfig, ...config };
};

// Bluetooth initialization
export const initializeBluetooth = async (): Promise<boolean> => {
  if (!navigator.bluetooth) {
    throw new Error('Bluetooth API not available in this browser');
  }
  return await navigator.bluetooth.getAvailability();
};

// Connection handler
export const connectToPrinter = async (): Promise<void> => {
  try {
    if (!await initializeBluetooth()) {
      throw new Error('Bluetooth not available');
    }

    if (isPrinterConnected()) {
      return;
    }

    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [printerConfig.serviceUUID]
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Connection to GATT server failed');

    const service = await server.getPrimaryService(printerConfig.serviceUUID);
    const characteristic = await service.getCharacteristic(printerConfig.characteristicUUID);

    connectedDevice = device;
    connectedServer = server;
    connectedCharacteristic = characteristic;

    // Handle disconnection events
    device.addEventListener('gattserverdisconnected', () => {
      disconnectPrinter();
    });
  } catch (error) {
    disconnectPrinter();
    throw error;
  }
};

// Print function
export const printTicket = async (
  gymName: string,
  ticketData: { id: string },
  sessionDetails?: {
    type: string;
    price: number;
    description?: string;
  },
  options?: {
    showDate?: boolean;
    additionalText?: string;
  }
): Promise<void> => {
  if (!isPrinterConnected()) {
    await connectToPrinter();
  }

  if (!connectedCharacteristic) {
    throw new Error('Printer not properly connected');
  }

 try {
    const encoder = new TextEncoder();
    const commands = [
      0x1B, 0x40, // Init
      0x1B, 0x61, 0x01, // Center align
      0x1B, 0x45, 0x01, // Bold
      ...encoder.encode(`${gymName}\n`),
      0x1B, 0x45, 0x00, 
      0x1B, 0x61, 0x00, 
      ...encoder.encode('------------------------------\n'),
      ...encoder.encode('Ticket d\'entrée\n\n'),      
      // Ajouter les détails de la session
      ...(sessionDetails ? encoder.encode(`Type: ${sessionDetails.description || sessionDetails.type}\n`) : []),      
      ...(options?.showDate !== false ? encoder.encode(`${new Date().toLocaleString()}\n`) : []),
      ...encoder.encode('------------------------------\n'),
      ...encoder.encode('Merci pour votre visite!\n'),
      0x1D, 0x56, 0x41, 0x03 
    ];

    await connectedCharacteristic.writeValueWithoutResponse(new Uint8Array(commands));
  } catch (error) {
    throw new Error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Disconnection
export const disconnectPrinter = (): void => {
  try {
    connectedServer?.disconnect();
  } finally {
    connectedDevice = null;
    connectedServer = null;
    connectedCharacteristic = null;
  }
};

// Status checkers
export const isPrinterConnected = (): boolean => {
  return connectedServer?.connected || false;
};

export const getConnectedPrinterName = (): string | null => {
  return connectedDevice?.name || null;
};

export const getPrinterStatus = () => {
  return {
    isConnected: isPrinterConnected(),
    printerName: getConnectedPrinterName(),
    device: connectedDevice
  };
};