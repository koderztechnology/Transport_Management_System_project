from playwright.sync_api import sync_playwright

def generate_pdf():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            with open('Actual_Database_Roadmap.html', 'r', encoding='utf-8') as f:
                html_content = f.read()

            page.set_content(html_content)
            page.pdf(path="Actual_Database_Roadmap_Full.pdf", format="A4", margin={"top":"15mm", "bottom":"15mm", "left":"15mm", "right":"15mm"}, print_background=True)
            browser.close()
        print("PDF successfully generated!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_pdf()
