import urllib.request
import json

base_url = "http://127.0.0.1:8000/api/"

endpoints = [
    "dashboard/",
    "drivers/",
    "fuel/",
    "toll/",
    "vehicles/",
    "trips/",
    "lr-bilty/",
    "eway-bills/",
    "finance-transactions/",
    "vendors/",
    "inventory/",
    "tracking/",
    "settings/"
]

results = []
for endpoint in endpoints:
    url = f"{base_url}{endpoint}"
    try:
        req = urllib.request.urlopen(url)
        status = req.getcode()
        results.append({"endpoint": url, "status": status, "success": True})
    except Exception as e:
        status = getattr(e, 'code', str(e))
        results.append({"endpoint": url, "status": status, "success": False})

print("API TEST RESULTS:")
print("-" * 50)
for r in results:
    status_text = "OK" if r['success'] else "FAILED"
    print(f"{r['endpoint']:<40} [{r['status']}] - {status_text}")
print("-" * 50)

# Generate Postman Collection
collection = {
    "info": {
        "name": "TMS Transport Management API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": []
}

for endpoint in endpoints:
    collection["item"].append({
        "name": f"GET {endpoint}",
        "request": {
            "method": "GET",
            "url": {
                "raw": f"{base_url}{endpoint}",
                "host": ["127", "0", "0", "1"],
                "port": "8000",
                "path": ["api", endpoint.strip('/')]
            }
        }
    })

with open("tms_postman_collection.json", "w") as f:
    json.dump(collection, f, indent=4)
    
print("\nGenerated 'tms_postman_collection.json'. You can import this file directly into Postman!")
