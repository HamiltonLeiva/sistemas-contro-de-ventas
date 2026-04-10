const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'mobile-small', size: { width: 320, height: 640 } },
  { name: 'mobile-large', size: { width: 768, height: 1024 } },
  { name: 'tablet', size: { width: 1024, height: 1366 } },
  { name: 'laptop', size: { width: 1366, height: 768 } },
  { name: 'desktop-large', size: { width: 1920, height: 1080 } }
];

for (const viewport of viewports) {
  test(`responsive smoke on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport.size);

    const runtimeErrors = [];
    page.on('pageerror', (err) => runtimeErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') runtimeErrors.push(msg.text());
    });

    await page.goto('/');
    await expect(page.locator('h1#section-title')).toHaveText(/Dashboard/);

    const widths = await page.evaluate(() => {
      const doc = document.documentElement;
      return { scroll: doc.scrollWidth, client: doc.clientWidth };
    });

    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);

    await page.click('button[data-section="productos"]');
    await expect(page.locator('h2', { hasText: 'Inventario' })).toBeVisible();

    await page.click('button[data-section="clientes"]');
    await expect(page.locator('h2', { hasText: 'Clientes' })).toBeVisible();

    await page.click('button[data-section="ventas"]');
    await page.click('#btn-nueva-venta');
    await expect(page.locator('#venta-form')).toBeVisible();

    // Stress: rapid section switching should not crash the app.
    for (let i = 0; i < 15; i += 1) {
      await page.click('button[data-section="dashboard"]');
      await page.click('button[data-section="ventas"]');
    }

    expect(runtimeErrors, `Console/runtime errors found: ${runtimeErrors.join(' | ')}`).toEqual([]);
  });
}
