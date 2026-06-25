import zipfile, re, pathlib
path = pathlib.Path(r'd:\tsn_access\Transport_Management_System_project\Doc3 ts.docx')
with zipfile.ZipFile(path) as z:
    for name in z.namelist():
        if name.endswith('.xml'):
            data = z.read(name).decode('utf-8', errors='ignore')
            if 'w:t' in data:
                values = re.findall(r'<w:t[^>]*>(.*?)</w:t>', data, flags=re.S)
                if values:
                    print('FILE', name)
                    print(''.join(values))
                    print('---')
