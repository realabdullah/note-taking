import { expect, test } from "@playwright/test"

test.describe("cross-device synchronization", () => {
  test.skip(!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD, "Requires a seeded test account")

  test("the same account sees a note in two browser contexts", async ({ browser }) => {
    const first = await browser.newContext()
    const second = await browser.newContext()
    const firstPage = await first.newPage()
    const secondPage = await second.newPage()

    for (const page of [firstPage, secondPage]) {
      await page.goto("/login")
      await page.getByLabel("EMAIL").fill(process.env.E2E_TEST_EMAIL!)
      await page.getByLabel("PASSWORD").fill(process.env.E2E_TEST_PASSWORD!)
      await page.getByRole("button", { name: /^sign in$/i }).click()
      await expect(page).toHaveURL("/")
    }

    await firstPage.getByLabel("Capture a note").fill("Two-device sync check")
    await firstPage.getByRole("button", { name: "Open full page" }).click()
    await expect(firstPage.getByLabel("Note content")).toHaveValue("Two-device sync check")

    await secondPage.reload()
    await secondPage.goto("/notes")
    await expect(secondPage.getByText("Two-device sync check")).toBeVisible()

    await first.close()
    await second.close()
  })
})
