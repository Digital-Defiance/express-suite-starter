import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// jsdom does not provide TextEncoder/TextDecoder, which react-router v8's
// server-runtime crypto module references at import time. Polyfill from node.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
