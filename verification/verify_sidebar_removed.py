import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the preview server
        page.goto("http://localhost:4173")

        # Wait for content to load
        page.wait_for_selector("main")

        # 1. Verify Left Sidebar is GONE
        # "Life Moments" was a link in the left sidebar. It should not be visible.
        # We check for the text. If it existed, it would be visible.
        # Note: "Life Moments" might be in the mobile menu code if I didn't remove it fully,
        # but I removed the `navItems` array and the sidebar block.
        # Let's check for the text.
        life_moments = page.get_by_text("Life Moments")
        if life_moments.count() > 0:
            expect(life_moments).not_to_be_visible()

        # Verify "Support Us" button (which was in sidebar) is gone or moved?
        # It was in the sidebar. I removed the sidebar.
        support_us = page.get_by_text("Support Us")
        if support_us.count() > 0:
            expect(support_us).not_to_be_visible()

        # 2. Verify Voice Upload Panel is VISIBLE
        # Look for "Personalize Voice" heading
        voice_header = page.get_by_role("heading", name="Personalize Voice")
        expect(voice_header).to_be_visible()

        # Look for "Upload an audio (WAV) or video file"
        upload_text = page.get_by_text("Upload an audio (WAV) or video file")
        expect(upload_text).to_be_visible()

        # 3. Take Screenshot
        page.screenshot(path="verification/screenshot.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
