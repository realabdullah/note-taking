import { expect, test } from "@playwright/test"

test("sign-in page presents the primary authentication flow", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("heading", { name: "Return to your notes." })).toBeVisible()
  await expect(page.getByLabel("EMAIL")).toBeVisible()
  await expect(page.getByLabel("PASSWORD", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
})

test("password visibility can be toggled", async ({ page }) => {
  await page.goto("/login")
  const password = page.getByLabel("PASSWORD", { exact: true })

  await password.fill("a private password")
  await expect(password).toHaveAttribute("type", "password")
  await page.getByRole("button", { name: "Show password" }).click()
  await expect(password).toHaveAttribute("type", "text")
  await expect(password).toHaveValue("a private password")
})

test("sign-up remains usable at a mobile viewport", async ({ page }) => {
  await page.goto("/signup")
  await expect(page.getByRole("heading", { name: "Start with a blank page." })).toBeVisible()
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible()
})
