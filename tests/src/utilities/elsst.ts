// Copyright CESSDA ERIC 2017-2026
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { getELSSTTerm } from '../../../src/utilities/elsst';

describe('getELSSTTerm (frontend utility)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns empty object and does not fetch when labels are empty', async () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as any;

    const controller = new AbortController();

    const result = await getELSSTTerm([], 'en', controller.signal);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('returns parsed JSON when fetch is successful', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        Term1: 'https://example.com/term1',
      }),
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

    const controller = new AbortController();

    const result = await getELSSTTerm(
      ['Term1'],
      'en',
      controller.signal
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${window.location.origin}/api/elsst/_terms`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })
    );

    expect(result).toEqual({
      Term1: 'https://example.com/term1',
    });
  });

  it('returns empty object when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    } as any);

    const controller = new AbortController();

    const result = await getELSSTTerm(
      ['Term1'],
      'en',
      controller.signal
    );

    expect(result).toEqual({});
  });

  it('handles aborted fetch gracefully', async () => {
    const abortError = new Error('Aborted');

    global.fetch = jest.fn().mockImplementation(() => {
      throw abortError;
    });

    const controller = new AbortController();
    controller.abort();

    const debugSpy = jest
      .spyOn(console, 'debug')
      .mockImplementation(() => { });

    const result = await getELSSTTerm(
      ['Term1'],
      'en',
      controller.signal
    );

    expect(result).toEqual({});
    expect(debugSpy).toHaveBeenCalled();

    debugSpy.mockRestore();
  });

  it('handles non-abort fetch errors gracefully', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error('Network failure');
    });

    const controller = new AbortController();

    const result = await getELSSTTerm(
      ['Term1'],
      'en',
      controller.signal
    );

    expect(result).toEqual({});
  });
});
