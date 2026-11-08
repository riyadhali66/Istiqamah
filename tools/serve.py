#!/usr/bin/env python3
"""Local preview with production-like gzip; no backend or personal-data requests.
Usage: python3 tools/serve.py [port], then open http://localhost:8000.
"""
import gzip,sys
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        name=self.translate_path(self.path)
        p=Path(name)
        if p.is_dir(): p=p/'index.html'
        if p.is_file() and p.suffix in {'.html','.css','.js','.json','.svg','.webmanifest'} and 'gzip' in self.headers.get('Accept-Encoding',''):
            data=gzip.compress(p.read_bytes(),mtime=0)
            self.send_response(200)
            self.send_header('Content-Type',self.guess_type(str(p)))
            self.send_header('Content-Encoding','gzip')
            self.send_header('Vary','Accept-Encoding')
            self.send_header('Content-Length',str(len(data)))
            self.send_header('Cache-Control','no-cache' if p.name in {'index.html','sw.js'} else 'public, max-age=86400')
            self.end_headers();self.wfile.write(data)
        else: super().do_GET()
if __name__=='__main__':
    ThreadingHTTPServer(('127.0.0.1',int(sys.argv[1]) if len(sys.argv)>1 else 8000),partial(Handler,directory=str(Path(__file__).resolve().parents[1]))).serve_forever()
