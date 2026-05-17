import { test, expect } from "@playwright/test";

// Helper: set localStorage key before page loads
async function withApiKey(page, fn) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tv_openrouter_key", "sk-test-fake-key");
  });
  await fn();
}

test.describe("Dashboard", () => {
  test("loads and shows Global Console", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Global Console")).toBeVisible();
    await expect(page.getByText("Global Score")).toBeVisible();
    await expect(page.getByText("New Validation")).toBeVisible();
  });

  test("sidebar nav exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("aside")).toBeVisible();
  });
});

test.describe("Market Validator", () => {
  test("market page loads with search input", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/market");
      await expect(page.getByText("Market Intelligence")).toBeVisible();
      await expect(page.locator('[data-testid="market-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="analyze-btn"]')).toBeVisible();
    });
  });

  test("analyze button is disabled when input is empty", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/market");
      const btn = page.locator('[data-testid="analyze-btn"]');
      await expect(btn).toBeDisabled();
    });
  });

  test("analyze button enables when niche is typed", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/market");
      const input = page.locator('[data-testid="market-input"]');
      await input.fill("AI scheduling for dentists");
      const btn = page.locator('[data-testid="analyze-btn"]');
      await expect(btn).toBeEnabled();
    });
  });
});

test.describe("Offer Builder activation", () => {
  test("offer builder page loads", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/offer");
      await expect(page.getByText("Offer Framework")).toBeVisible();
    });
  });

  test("shows go-to-market banner when no market data", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/offer");
      await expect(page.getByText("No market analysis found")).toBeVisible();
    });
  });

  test("shows build button when market data with score >= 7", async ({ page }) => {
    const marketResult = {
      niche: "AI tools for dentists",
      totalScore: 8.5,
      recommendation: "GO",
      avatar: { who: "Dentist", frustration: "Admin work", desire: "More patients", wordsTheyUse: [] },
      signals: [],
      differentiators: [],
    };
    await page.addInitScript((data) => {
      window.localStorage.setItem("tv_openrouter_key", "sk-test-fake-key");
      window.sessionStorage.setItem("tv_market_result", JSON.stringify(data));
    }, marketResult);
    await page.goto("/offer");
    await expect(page.getByText("Market context loaded")).toBeVisible();
    await expect(page.locator('[data-testid="generate-offer-btn"]')).toBeVisible();
  });
});

test.describe("Trade Validator", () => {
  test("trade page loads with inputs", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/trade");
      await expect(page.getByText("Trade Instrument Verification")).toBeVisible();
      await expect(page.locator('[data-testid="instrument-type"]')).toBeVisible();
      await expect(page.locator('[data-testid="issuing-bank"]')).toBeVisible();
    });
  });

  test("validate button exists and visible", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/trade");
      await expect(page.locator('[data-testid="validate-btn"]')).toBeVisible();
    });
  });
});

test.describe("Client Validator", () => {
  test("client page loads with input", async ({ page }) => {
    await withApiKey(page, async () => {
      await page.goto("/client");
      await expect(page.getByText("Client Risk Analysis")).toBeVisible();
      await expect(page.locator('[data-testid="client-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-validate-btn"]')).toBeVisible();
    });
  });
});

test.describe("PDF Export", () => {
  test("report page loads", async ({ page }) => {
    await page.goto("/report");
    await expect(page.getByText("Generate Validation Report")).toBeVisible();
    await expect(page.locator('[data-testid="download-pdf-btn"]')).toBeVisible();
  });

  test("download button is disabled when no data", async ({ page }) => {
    await page.goto("/report");
    await expect(page.locator('[data-testid="download-pdf-btn"]')).toBeDisabled();
  });

  test("download button enables when market data in session", async ({ page }) => {
    const data = { niche: "test", totalScore: 8, recommendation: "GO" };
    await page.addInitScript((d) => {
      window.sessionStorage.setItem("tv_market_result", JSON.stringify(d));
    }, data);
    await page.goto("/report");
    await expect(page.locator('[data-testid="download-pdf-btn"]')).toBeEnabled();
  });
});

test.describe("Levy Agent", () => {
  test("levy toggle button visible on dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="levy-toggle"]')).toBeVisible();
  });

  test("clicking toggle opens chat panel", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="levy-toggle"]').click();
    await expect(page.locator('[data-testid="levy-panel"]')).toBeVisible();
    await expect(page.getByText("Hello! I'm Levy")).toBeVisible();
  });

  test("chat input is visible inside panel", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="levy-toggle"]').click();
    await expect(page.locator('[data-testid="levy-input"]')).toBeVisible();
  });
});

test.describe("No JS errors", () => {
  test("dashboard has no console errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("market page has no console errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.addInitScript(() => {
      window.localStorage.setItem("tv_openrouter_key", "sk-test-fake-key");
    });
    await page.goto("/market");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("trade page has no console errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.addInitScript(() => {
      window.localStorage.setItem("tv_openrouter_key", "sk-test-fake-key");
    });
    await page.goto("/trade");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
