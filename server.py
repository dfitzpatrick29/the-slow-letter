#!/usr/bin/env python3
import http.server
import urllib.request
import urllib.error
import ssl
import json
import os

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

API_KEY  = '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'
NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args)

    def send_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors()
        self.end_headers()

    def do_POST(self):
        if self.path != '/proxy':
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)

        req = urllib.request.Request(
            NVIDIA_URL,
            data=body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {API_KEY}',
            },
        )

        try:
            print(f'→ sending to NVIDIA, model={json.loads(body).get("model")}')
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=30) as resp:
                data = resp.read()
                print(f'← NVIDIA responded, {len(data)} bytes')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors()
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            err = e.read()
            print(f'← NVIDIA HTTP error {e.code}:', err[:300])
            self.send_response(e.code)
            self.send_cors()
            self.end_headers()
            self.wfile.write(err)
        except Exception as e:
            print(f'← proxy exception: {e}')
            self.send_response(500)
            self.send_cors()
            self.end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(f'open http://localhost:{PORT}')
http.server.HTTPServer(('localhost', PORT), Handler).serve_forever()
