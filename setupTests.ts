import { TransformStream } from 'node:stream/web';
import { TextEncoder, TextDecoder } from 'node:util';
import '@testing-library/jest-dom';
import fetch from 'jest-mock-fetch' ;

// @ts-expect-error - overriding default fetch
global.fetch = fetch;

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

if (!global.TransformStream) {
  global.TransformStream = TransformStream as typeof global.TransformStream;
}
