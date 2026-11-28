#!/usr/bin/env python3
"""
Continuum App - Local Dev Server
Serves static files and proxies /api/* to production Vercel deployment.

Usage:
    python3 dev_server.py [port]

Environment:
    VERCEL_URL - Override the production API base (default: https://continuum-app.vercel.app)
"""
import http.server
import os
import socketserver
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Configuration
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
VERCEL_URL = os.environ.get("VERCEL_URL", "https://continuum-app.vercel.app").rstrip("/")
PROJECT_ROOT = Path(__file__).parent.resolve()

# MIME types for static files
MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
}


class DevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def log_message(self, format, *args):
        # Quieter logs
        if "/api/" not in str(args[0]):
            super().log_message(format, *args)

    def do_GET(self):
        if self.path.startswith("/api/"):
            self.proxy_request("GET")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            self.proxy_request("POST")
        else:
            super().do_POST()

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            self.proxy_request("DELETE")
        else:
            super().do_DELETE()

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.end_headers()
        else:
            super().do_OPTIONS()

    def proxy_request(self, method):
        """Forward request to Vercel production API."""
        # Build target URL
        target_url = f"{VERCEL_URL}{self.path}"

        # Read request body for POST/PUT
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        # Create request
        req = urllib.request.Request(target_url, data=body, method=method)

        # Copy headers (except host)
        for header, value in self.headers.items():
            if header.lower() not in ("host", "content-length", "connection"):
                req.add_header(header, value)

        try:
            # Make request
            with urllib.request.urlopen(req, timeout=30) as response:
                # Send response status
                self.send_response(response.status)

                # Copy response headers
                for header, value in response.headers.items():
                    if header.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(header, value)

                self.end_headers()

                # Stream response body
                while True:
                    chunk = response.read(8192)
                    if not chunk:
                        break
                    self.wfile.write(chunk)

        except urllib.error.HTTPError as e:
            # Forward error response
            self.send_response(e.code)
            for header, value in e.headers.items():
                if header.lower() not in ("transfer-encoding", "connection"):
                    self.send_header(header, value)
            self.end_headers()
            self.wfile.write(e.read())

        except Exception as e:
            # Network error
            error_msg = f"Proxy error: {e}"
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(f'{{"error": "{error_msg}"}}'.encode())

    def guess_type(self, path):
        """Better MIME type detection."""
        ext = Path(path).suffix.lower()
        if ext in MIME_TYPES:
            return MIME_TYPES[ext]
        return super().guess_type(path)

    def end_headers(self):
        # Add CORS headers for local dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()


class ThreadedTCPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    print(f"🚀 Continuum App Dev Server")
    print(f"   Static files: http://localhost:{PORT}")
    print(f"   API proxy:    {VERCEL_URL}/api/*")
    print(f"   Press Ctrl+C to stop\n")

    try:
        with ThreadedTCPServer(("", PORT), DevHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"\n❌ Port {PORT} is already in use. Try: python3 dev_server.py {PORT+1}")
        else:
            print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
