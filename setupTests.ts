import { TextEncoder, TextDecoder } from 'node:util'
import '@testing-library/jest-dom';
import fetch from 'jest-mock-fetch' ;

// @ts-expect-error - overriding default fetch
global.fetch = fetch;

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
  //@ts-expect-error - expect error
  global.TextDecoder = TextDecoder
}
