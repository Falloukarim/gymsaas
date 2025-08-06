// src/types/global.d.ts
interface Navigator {
  bluetooth?: {
    requestDevice(options: BluetoothRequestOptions): Promise<BluetoothDevice>;
  };
}

interface BluetoothRequestOptions {
  acceptAllDevices?: boolean;
  optionalServices?: string[];
  filters?: BluetoothLEScanFilter[];
}