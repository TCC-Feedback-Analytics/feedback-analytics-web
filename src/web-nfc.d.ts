/**
 * Web NFC (só no Chrome do Android): o TypeScript ainda não traz esses tipos.
 * Só o que o card "Etiqueta NFC" usa — gravar um registro de URL.
 * https://w3c.github.io/web-nfc/
 */
interface NDEFRecordInit {
  recordType: string;
  data?: string;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

declare class NDEFReader {
  constructor();
  write(message: NDEFMessageInit, options?: NDEFWriteOptions): Promise<void>;
}

interface Window {
  NDEFReader?: typeof NDEFReader;
}
