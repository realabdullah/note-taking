import { expect, test } from "@playwright/test";

test("protected pages redirect before rendering the application shell", async ({ request }) => {
	const response = await request.get("/", { maxRedirects: 0 });

	expect(response.status()).toBe(302);
	expect(response.headers().location).toBe("/login?redirect=/");
	expect(await response.text()).not.toContain("Quick capture");
});

test("sign-in page presents the primary authentication flow", async ({ page }) => {
	await page.goto("/login");
	await expect(page.getByRole("heading", { name: "Return to your workspace." })).toBeVisible();
	await expect(page.getByLabel("EMAIL")).toBeVisible();
	await expect(page.getByLabel("PASSWORD", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("password visibility can be toggled", async ({ page }) => {
	await page.goto("/login");
	const password = page.getByLabel("PASSWORD", { exact: true });
	const visibilityButton = page.getByRole("button", { name: "Show password" });

	await expect(visibilityButton).toHaveAttribute("data-hydrated", "true", { timeout: 15_000 });
	await password.fill("a private password");
	await expect(password).toHaveAttribute("type", "password");
	await visibilityButton.click();
	await expect(password).toHaveAttribute("type", "text");
	await expect(password).toHaveValue("a private password");
});

test("sign-up remains usable at a mobile viewport", async ({ page }) => {
	await page.goto("/signup");
	await expect(page.getByRole("heading", { name: "Give your thoughts somewhere to grow." })).toBeVisible();
	await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
});
