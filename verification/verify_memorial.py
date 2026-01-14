
from playwright.sync_api import Page, expect, sync_playwright

def test_memorial_page(page: Page):
  # 1. Arrange: Go to the homepage.
  page.goto("http://localhost:4173")

  # Wait for the page to load
  page.wait_for_load_state("networkidle")

  # 2. Assert: Check for key elements of the new design.
  expect(page.get_by_role("heading", name="Conversation")).to_be_visible()

  # Check sidebar title
  expect(page.locator("aside").first.get_by_text("Memorial")).to_be_visible()

  # Check nav item "Whispers" (exact match to avoid "Recent Whispers")
  expect(page.get_by_text("Whispers", exact=True)).to_be_visible()

  # 3. Screenshot: Capture the final result for visual verification.
  page.screenshot(path="verification/memorial_page.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Set viewport to desktop size to make sure sidebar is visible
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    try:
      test_memorial_page(page)
    finally:
      browser.close()
