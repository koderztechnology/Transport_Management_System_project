import glob
import os

replacements = {
    '<ResponsiveContainer width="100%" height="100%">': '<ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>',
    '<ResponsiveContainer width="100%" height={250}>': '<ResponsiveContainer width="100%" height={250} minHeight={1} minWidth={1}>',
    '<ResponsiveContainer width="100%" height={200}>': '<ResponsiveContainer width="100%" height={200} minHeight={1} minWidth={1}>',
    '<ResponsiveContainer width="100%" height={300}>': '<ResponsiveContainer width="100%" height={300} minHeight={1} minWidth={1}>',
    '<ResponsiveContainer width="100%" height={350}>': '<ResponsiveContainer width="100%" height={350} minHeight={1} minWidth={1}>'
}

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()
    
    modified = False
    for k, v in replacements.items():
        if k in text:
            text = text.replace(k, v)
            modified = True
            
    if modified:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Fixed {filename}")

for filename in glob.glob('frontend/src/pages/*.jsx'):
    process_file(filename)

components_dir = 'frontend/src/components'
for root, dirs, files in os.walk(components_dir):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
