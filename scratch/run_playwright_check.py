import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    print("Launching Playwright...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        console_logs = []
        page_errors = []
        
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: page_errors.append(err.message))
        
        filepath = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\reportes.html"
        file_url = "file://" + filepath.replace("\\", "/")
        
        print(f"Navigating to: {file_url}")
        # Navigate once to establish origin so we can set localStorage
        await page.goto(file_url)
        
        print("Setting mock currentUser in localStorage...")
        await page.evaluate("""() => {
            localStorage.setItem('currentUser', JSON.stringify({
                id: 1,
                usuario: 'admin',
                nombres: 'DR. JOSEHP CHRISTOPHER CASTILLO CUENCA',
                perfil: 'Administrador'
            }));
        }""")
        
        print("Reloading page to apply user session...")
        await page.goto(file_url)
        
        print("Waiting for page load and table rendering...")
        await page.wait_for_timeout(3000)
        
        print("Captured initial console logs:")
        for log in console_logs:
            print("  ", log)
        console_logs.clear()
        
        print("Attempting to click edit button...")
        # Find first edit button
        edit_buttons = await page.query_selector_all(".edit-btn")
        print(f"Found {len(edit_buttons)} edit buttons.")
        if edit_buttons:
            print("Clicking the first edit button...")
            await edit_buttons[0].click()
            await page.wait_for_timeout(2000)
        else:
            print("No edit buttons found in the DOM!")
            
        print("\nCaptured console logs after click:")
        for log in console_logs:
            print("  ", log)
            
        print("\nCaptured page errors (uncaught exceptions):")
        for err in page_errors:
            print("  ", err)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
