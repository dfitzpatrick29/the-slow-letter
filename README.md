# the slow letter

A single sentence, written over the duration of your presence. It never ends.

## Setup

**1. Install Ollama**

Download from https://ollama.com and install.

**2. Pull the model**

```
ollama pull qwen2.5:3b
```

**3. Start the server**

```
ollama serve
```

Ollama listens on `http://localhost:11434` by default. Leave this running.

**4. Add fonts (optional)**

Drop `.woff2` files into the `/fonts` directory. See `fonts/README.md` for details. Falls back to Georgia if none are present.

**5. Open the page**

Open `index.html` in Chrome. Grant camera permission when prompted.

The sentence begins immediately. Close the tab when you are done. Nothing is saved.

## Configuration

At the top of `main.js`:

```js
const MODEL = 'qwen2.5:3b';   // swap for any model you have pulled
const INTERVAL_MIN = 20000;    // minimum milliseconds between clauses
const INTERVAL_MAX = 30000;    // maximum milliseconds between clauses
```

## Notes

- No data leaves your machine. The camera feed is processed locally; only derived signals (motion level, brightness, position) inform the prompt. No pixels are sent anywhere.
- The system prompt is in `/prompts/v1.md`. Edit it freely.
- The sentence dissolves when you close the tab. This is intentional.
