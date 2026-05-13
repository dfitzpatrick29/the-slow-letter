# the slow letter

A single sentence, written over the duration of your presence. It never ends.

The webcam captures a frame every few seconds. That image is sent to a vision model, which writes one clause describing what it sees — your posture, the light, what's behind you. The clause appears on screen and the sentence grows. Close the tab and it dissolves. Nothing is saved.

## Live

**[the-slow-letter.netlify.app](https://the-slow-letter.netlify.app)**

Grant camera permission when prompted. That's it.

## Run locally

```
python3 server.py
```

Open `http://localhost:8080` in Chrome. The server proxies requests to the NVIDIA API — add your key at the top of `server.py`.

## Configuration

At the top of `main.js`:

```js
const MODEL = 'meta/llama-4-maverick-17b-128e-instruct';
const INTERVAL_MIN = 3000;   // min ms between clauses
const INTERVAL_MAX = 5000;   // max ms between clauses
```
