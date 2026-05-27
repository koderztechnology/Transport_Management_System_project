import time
import urllib.request

endpoints = [
    'http://127.0.0.1:8000/api/finance-transactions/',
    'http://127.0.0.1:8000/api/inventory/',
    'http://127.0.0.1:8000/api/vehicles/',
    'http://127.0.0.1:8000/api/trips/',
    'http://127.0.0.1:8000/api/vendors/',
    'http://127.0.0.1:8000/api/dashboard/',
]

for url in endpoints:
    start_time = time.time()
    try:
        req = urllib.request.urlopen(url)
        data = req.read()
        print(f"[{time.time() - start_time:.4f}s] {url} - {len(data)} bytes")
    except Exception as e:
        print(f"[{time.time() - start_time:.4f}s] {url} - ERROR: {e}")
