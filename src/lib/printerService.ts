/// <reference types="web-bluetooth" />
// ESC/POS Bluetooth printing for 80mm thermal printers

const PRINTER_UUIDS = [
  { service: "000018f0-0000-1000-8000-00805f9b34fb", char: "00002af1-0000-1000-8000-00805f9b34fb" },
  { service: "49535343-fe7d-4ae5-8fa9-9fafd205e455", char: "49535343-8841-43f4-a8d4-ecbe34729bb3" },
  { service: "e7810a71-73ae-499d-8c15-faa9aef0c3f2", char: "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f" },
];

// ESC/POS command bytes
const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

const CMD = {
  INIT:       [ESC, 0x40],
  CENTER:     [ESC, 0x61, 0x01],
  LEFT:       [ESC, 0x61, 0x00],
  BOLD_ON:    [ESC, 0x45, 0x01],
  BOLD_OFF:   [ESC, 0x45, 0x00],
  DOUBLE_ON:  [ESC, 0x21, 0x30],
  DOUBLE_OFF: [ESC, 0x21, 0x00],
  CUT:        [GS, 0x56, 0x01],
  LINE:       [LF],
};

const COLS = 42; // 80mm paper = 42 characters per line

let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function bytes(...cmds: number[][]): Uint8Array {
  const flat = cmds.flat();
  return new Uint8Array(flat);
}

function pad(left: string, right: string, width: number): string {
  const gap = width - left.length - right.length;
  return left + " ".repeat(Math.max(1, gap)) + right;
}

function divider(): string {
  return "-".repeat(COLS) + "\n";
}

function doubleDivider(): string {
  return "=".repeat(COLS) + "\n";
}

export async function connectPrinter(): Promise<void> {
  if (!navigator.bluetooth) throw new Error("Web Bluetooth not supported on this browser.");

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: PRINTER_UUIDS.map((u) => u.service),
  });

  const server = await device.gatt!.connect();

  for (const { service, char } of PRINTER_UUIDS) {
    try {
      const svc = await server.getPrimaryService(service);
      characteristic = await svc.getCharacteristic(char);
      return;
    } catch {
      // try next UUID
    }
  }

  throw new Error("Could not find a compatible printer service. Check your printer model.");
}

export function isPrinterConnected(): boolean {
  return characteristic !== null;
}

export function disconnectPrinter(): void {
  characteristic = null;
}

async function write(data: Uint8Array): Promise<void> {
  if (!characteristic) throw new Error("Printer not connected.");
  const CHUNK = 512;
  for (let i = 0; i < data.length; i += CHUNK) {
    await characteristic.writeValue(data.slice(i, i + CHUNK));
  }
}

export interface ReceiptData {
  orderItems: { name: string; quantity: number; price: number }[];
  orderType:  string;
  total:      number;
  payment:    string;
  cashReceived?: number;
  change?:    number;
  receiptNumber: string;
  date:       string;
  time:       string;
  shopName?:      string;
  shopAddress?:   string;
  receiptFooter?: string;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  "dine-in":  "Dine-In",
  "takeout":  "Take Out",
  "delivery": "Delivery",
};

export async function printReceipt(data: ReceiptData): Promise<void> {
  const lines: Uint8Array[] = [];

  const cmd = (...c: number[][]) => lines.push(bytes(...c));
  const text = (t: string)       => lines.push(encode(t));
  const nl   = ()                 => lines.push(new Uint8Array([LF]));

  // Init
  cmd(CMD.INIT);

  // Header
  cmd(CMD.CENTER);
  cmd(CMD.DOUBLE_ON, CMD.BOLD_ON);
  text(`${data.shopName ?? "KATAS PH"}\n`);
  cmd(CMD.DOUBLE_OFF, CMD.BOLD_OFF);
  if (data.shopAddress) text(`${data.shopAddress}\n`);
  nl();

  cmd(CMD.LEFT);
  text(doubleDivider());

  // Receipt info
  text(`Date: ${data.date}   Time: ${data.time}\n`);
  text(`Receipt: #${data.receiptNumber}\n`);
  text(`Order Type: ${ORDER_TYPE_LABELS[data.orderType] ?? data.orderType}\n`);
  text(doubleDivider());

  // Items
  for (const item of data.orderItems) {
    const subtotal = (item.price * item.quantity).toFixed(2);
    text(pad(`${item.quantity}x ${item.name}`, `P${subtotal}`, COLS) + "\n");
  }

  text(divider());

  // Total
  cmd(CMD.BOLD_ON);
  text(pad("TOTAL:", `P${data.total.toFixed(2)}`, COLS) + "\n");
  cmd(CMD.BOLD_OFF);

  text(doubleDivider());

  // Payment
  text(`PAYMENT: ${data.payment === "cash" ? "CASH" : "ONLINE PAYMENT"}\n`);
  if (data.payment === "cash" && data.cashReceived) {
    text(`CASH RECEIVED:  P${data.cashReceived.toFixed(2)}\n`);
    text(`CHANGE:         P${(data.change ?? 0).toFixed(2)}\n`);
  }
  text(`STATUS: APPROVED\n`);

  text(doubleDivider());

  // Footer
  cmd(CMD.CENTER);
  text(`${data.receiptFooter ?? "PLEASE COME AGAIN!"}\n`);
  nl();
  cmd(CMD.BOLD_ON);
  text("THANK YOU FOR YOUR ORDER!\n");
  cmd(CMD.BOLD_OFF);
  nl();
  nl();
  nl();

  // Cut
  cmd(CMD.CUT);

  // Send all lines
  const total = lines.reduce((sum, l) => sum + l.length, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const line of lines) {
    combined.set(line, offset);
    offset += line.length;
  }

  await write(combined);
}
