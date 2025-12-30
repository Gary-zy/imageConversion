/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Simplified compatibility layer for modern browsers
// Most polyfills are no longer needed in modern browsers

if (typeof globalThis === "undefined" || !globalThis._pdfjsCompatibilityChecked) {
  if (typeof globalThis !== "undefined") {
    globalThis._pdfjsCompatibilityChecked = true;
  }

  // Support: IE, Node.js - ReadableStream polyfill
  (function checkReadableStream() {
    let isReadableStreamSupported = false;

    if (typeof ReadableStream !== "undefined") {
      try {
        new ReadableStream({
          start(controller) {
            controller.close();
          },
        });
        isReadableStreamSupported = true;
      } catch (e) {
        // The ReadableStream constructor cannot be used.
      }
    }
    if (isReadableStreamSupported) {
      return;
    }
    // Dynamic import for web-streams-polyfill
    import("web-streams-polyfill").then((module) => {
      globalThis.ReadableStream = module.ReadableStream;
    }).catch(() => {
      // Polyfill not available, but likely not needed in modern browsers
    });
  })();
}
