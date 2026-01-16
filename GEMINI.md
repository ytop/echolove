# Google GenAI Implementation Analysis

This document outlines how the Google GenAI SDK is integrated into the project for realtime voice interaction.

## 1. Implementation Location
- **File**: `app/components/ChatWindow.tsx`
- **Context**: The integration is purely client-side (Browser to Google servers).

## 2. SDK Usage
- **Library**: `@google/genai`
- **Loading Strategy**: Dynamic import is used to reduce initial bundle size:
  ```typescript
  const { GoogleGenAI, Modality } = await import('@google/genai');
  ```
- **Initialization**: 
  ```typescript
  const ai = new GoogleGenAI({ apiKey });
  ```

## 3. Connection Logic (Realtime / Live API)
The application uses the `live.connect` method for low-latency bidirectional streaming, specifically designed for voice interaction.

- **Model**: `gemini-2.5-flash-native-audio-preview-12-2025`
- **Configuration**:
  - `responseModalities`: set to `[Modality.AUDIO]` to ensure the model responds with voice.
  - `systemInstruction`: A dynamic prompt is constructed based on the user-defined `persona` to instruct the model on how to behave (tone, style, role).

## 4. Audio Processing

### Input (Microphone)
1. **Capture**: Uses `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. **Processing**:
   - Uses `ScriptProcessorNode` to intercept raw audio data.
   - Downsamples/Converts audio to **16kHz PCM**.
3. **Transmission**:
   - Sends audio chunks in realtime via `session.sendRealtimeInput`.
   - Sends user-uploaded voice `samples` (Base64 WAV) initially to provide context/voice cloning data to the model.

### Output (Speaker)
1. **Reception**: Listens to the `onmessage` callback.
2. **Decoding**:
   - Extracts Base64 PCM audio data from `serverContent.modelTurn.parts[0].inlineData`.
   - Decodes the Base64 string to a `Uint8Array`.
3. **Playback**:
   - Uses the Web Audio API (`AudioContext`).
   - Schedules audio chunks to play sequentially to ensure smooth playback.

## 5. Authentication & Environment Variables (Critical Issue)
The code attempts to retrieve the API key from a global variable:
```typescript
const apiKey = (window as any).ENV?.API_KEY;
```

**Current Status**:
- The `app/root.tsx` and `app/routes/index.tsx` files currently **do not** inject this `API_KEY` from the server environment (Cloudflare Workers) into the browser's `window` object.
- **Result**: The "Start Resonance" feature will fail with an alert: *"API Key is missing. Please check your environment."* unless the environment variable injection is implemented in the loader.

## 6. Cloudflare Worker Implementation
The `workers` directory contains the server-side entry point for the application.

- **File**: `workers/app.ts`
- **Framework**: Hono (optimized for Cloudflare Workers) + React Router Adapter.
- **Role**:
  - **SSR Host**: Acts as the web server that renders the React application on the Edge.
  - **Request Handler**: Intercepts all incoming requests (`app.get("*")`) and passes them to React Router's `createRequestHandler`.
  - **Environment Bridge**: Passes Cloudflare Bindings (env vars, D1, KV) to the React application context.
- **Current Limitation**:
  - The worker is currently **only** serving the frontend.
  - No `loader` or `action` functions are implemented in `app/routes/`, meaning the worker is not yet used for server-side data fetching, database interactions, or API logic.

## 7. Client-Side vs Server-Side Verification
It is confirmed that Google GenAI interactions occur **exclusively on the client side** (browser):

1. **Exclusively Client-Side Code**: The `@google/genai` SDK is only imported and used within `app/components/ChatWindow.tsx`.
2. **Browser Dependency**: The implementation uses `navigator.mediaDevices.getUserMedia` and `AudioContext`, which are browser-only APIs and not available in Cloudflare Workers.
3. **Worker Isolation**: `workers/app.ts` contains no logic related to GenAI; its role is limited to routing and SSR of the React application.
4. **Direct Interaction**: The realtime voice session establishes a direct connection between the user's browser and Google's servers, meaning the AI traffic does not pass through the Cloudflare Worker.
