from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:4173")
            page.wait_for_load_state("networkidle")

            # Verify background gradient (indirectly, by screenshot)
            # Verify Icons (check if svg elements exist in Sidebar)

            # Check Sidebar
            page.screenshot(path="verification/entry_page.png")
            print("Screenshot saved to verification/entry_page.png")

            # Check for Lucide icons (svgs should be present)
            svg_count = page.locator("svg").count()
            print(f"Found {svg_count} SVG icons")

            if svg_count > 0:
                print("Icons verified.")
            else:
                print("No SVG icons found, something might be wrong.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
