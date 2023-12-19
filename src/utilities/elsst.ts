// Copyright CESSDA ERIC 2017-2023
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

export interface TermURIResult extends Record<string, string> {}

export async function getELSSTTerm(labels: string[], lang: string, signal: AbortSignal): Promise<TermURIResult> {
  // Only send a request if the list of labels is not empty
  if (labels.length === 0) {
    return {};
  }

  const body = {
    lang: lang,
    labels: labels
  };

  // Request term from ELSST, the label is encoded
  try {
    const response = await fetch(`${window.location.origin}/api/elsst/_terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal
    });

    // Match potentially found - try to extract the URI
    if (response.ok) {
      return await response.json() as TermURIResult;
    }
  } catch (error) {
    // Log error on debug level if it was because the fetch got aborted
    if (error instanceof DOMException && error.message === 'The user aborted a request.'){
      console.debug(`ELSST term fetching was aborted (${error})`);
    } else {
      console.log(`Error while fetching ELSST terms: ${error}`);
    }
  }

  // Response not OK
  return {};
}
