import '@testing-library/jest-dom';

import { URLSearchParams as NodeURLSearchParams } from 'node:url';
import { transferableAbortController } from 'node:util';
import { vi } from 'vitest';

// O jsdom fornece URLSearchParams/AbortController de outro realm, enquanto o
// Request usado pelo React Router vem do Node (Undici). O Node valida a origem
// dessas instancias e rejeita submissions quando as implementacoes sao
// misturadas. Mantenha as Web APIs usadas na criacao do Request no mesmo realm
// durante toda a execucao de cada arquivo de teste.
Object.defineProperty(globalThis, 'URLSearchParams', {
  configurable: true,
  writable: true,
  value: NodeURLSearchParams,
});

Object.defineProperty(globalThis, 'AbortController', {
  configurable: true,
  writable: true,
  value: transferableAbortController().constructor,
});

vi.mock('react-router-dom', () => ({
  useRouteLoaderData: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const storage = new Map<string, string>();
const storageMock: Storage = {
  get length() {
    return storage.size;
  },
  clear: () => storage.clear(),
  getItem: (key) => storage.get(key) ?? null,
  key: (index) => [...storage.keys()][index] ?? null,
  removeItem: (key) => storage.delete(key),
  setItem: (key, value) => storage.set(String(key), String(value)),
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: storageMock,
});
