from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

if __name__ == "__main__":
    os.chdir(ROOT / "static")
    host, port = "0.0.0.0", 8000
    print("\nNEX ARENA is running.")
    print("Open on this phone: http://127.0.0.1:8000")
    print("Stop the server with CTRL+C\n")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
