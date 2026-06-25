import os

pages_dir = "src/pages"
files = [f for f in os.listdir(pages_dir) if f.endswith(".jsx")]

for f in files:
    filepath = os.path.join(pages_dir, f)
    with open(filepath, "r", encoding="utf-8") as file:
        lines = file.readlines()
    for i, line in enumerate(lines):
        if "<table" in line:
            print(f"{f} line {i+1}:")
            # print previous 3 lines
            start = max(0, i - 3)
            for j in range(start, i + 1):
                print(f"  {j+1}: {lines[j].strip()}")
