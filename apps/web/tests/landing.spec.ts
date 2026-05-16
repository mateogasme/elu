import { test, expect, type Page, type Locator } from '@playwright/test';

// Helpers ------------------------------------------------------------------

function rootInSection(page: Page, sectionId: string): Locator {
  return page.locator(`#${sectionId} [data-elu-root]`).first();
}

async function open(root: Locator) {
  await root.locator('[data-elu-trigger]').click();
  await expect(root).toHaveAttribute('data-state', 'open');
}

async function escape(page: Page, root: Locator) {
  await page.keyboard.press('Escape');
  await expect(root).toHaveAttribute('data-state', 'closed');
}

// Tests --------------------------------------------------------------------

test.describe('Landing — structural smoke', () => {
  test('renders all section anchors', async ({ page }) => {
    await page.goto('/');
    const ids = [
      'installation', 'frameworks', 'usage', 'multi', 'searchable',
      'grouped', 'sizes', 'theme', 'css-variables', 'examples',
    ];
    for (const id of ids) await expect(page.locator(`#${id}`)).toBeVisible();
  });

  test('every Elu.Root mounts a controller', async ({ page }) => {
    await page.goto('/');
    const booted = await page.locator('[data-elu-root][data-elu-booted="true"]').count();
    expect(booted).toBeGreaterThan(5);
    expect(await page.locator('[data-elu-root]:not([data-elu-booted="true"])').count()).toBe(0);
  });
});

test.describe('Single-select (Usage section)', () => {
  test('click → open → select → close → value updates', async ({ page }) => {
    await page.goto('/');
    const root = rootInSection(page, 'usage');
    await open(root);

    await root.locator('[data-elu-item][data-value="lemon"]').click();

    await expect(root).toHaveAttribute('data-state', 'closed');
    await expect(root.locator('[data-elu-value]')).toHaveText('Lemon');
    await expect(root.locator('[data-elu-item][data-value="lemon"]')).toHaveAttribute('data-selected', 'true');
  });

  test('keyboard: Enter opens, ArrowDown highlights, Enter selects', async ({ page }) => {
    await page.goto('/');
    const root = rootInSection(page, 'usage');
    await root.locator('[data-elu-trigger]').focus();
    await page.keyboard.press('Enter');
    await expect(root).toHaveAttribute('data-state', 'open');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(root).toHaveAttribute('data-state', 'closed');
    const value = (await root.locator('[data-elu-value]').textContent())?.trim();
    expect(value).toBeTruthy();
  });

  test('Escape closes without committing selection', async ({ page }) => {
    await page.goto('/');
    const root = rootInSection(page, 'usage');
    const before = (await root.locator('[data-elu-value]').textContent())?.trim();
    await open(root);
    await page.keyboard.press('ArrowDown');
    await escape(page, root);
    expect((await root.locator('[data-elu-value]').textContent())?.trim()).toBe(before);
  });
});

test.describe('Multi-select', () => {
  test('toggles items and keeps content open', async ({ page }) => {
    await page.goto('/');
    const root = rootInSection(page, 'multi');
    await open(root);

    const items = root.locator('[data-elu-item]');
    await items.nth(0).click();
    await expect(root).toHaveAttribute('data-state', 'open');
    await items.nth(1).click();
    await expect(root).toHaveAttribute('data-state', 'open');
    await items.nth(2).click();
    await expect(root).toHaveAttribute('data-state', 'open');

    // 3+ selected → "N selected" label per controller (1 = name, 2 = "A, B", 3+ = count).
    await expect(root.locator('[data-elu-value]')).toContainText('3 selected');

    // Toggle one off.
    await items.nth(0).click();
    await expect(items.nth(0)).not.toHaveAttribute('data-selected', 'true');
    await expect(items.nth(1)).toHaveAttribute('data-selected', 'true');
  });
});

test.describe('Searchable', () => {
  test('filters items and shows empty state on zero matches', async ({ page }) => {
    await page.goto('/');
    const root = rootInSection(page, 'searchable');
    await open(root);

    const input = root.locator('[data-elu-search] input');
    await input.fill('fra');
    // At least one item visible, at least one item hidden.
    const visibleCount = await root.locator('[data-elu-item]:not([hidden])').count();
    const hiddenCount = await root.locator('[data-elu-item][hidden]').count();
    expect(visibleCount).toBeGreaterThan(0);
    expect(hiddenCount).toBeGreaterThan(0);

    // Zero matches → empty pane visible.
    await input.fill('zzzzzz-no-match');
    await expect(root.locator('[data-elu-empty]')).toBeVisible();
  });
});

test.describe('Sizes', () => {
  test('size buttons swap data-size on preview root', async ({ page }) => {
    await page.goto('/');
    const preview = page.locator('#size-preview');

    await page.locator('[data-size-buttons] [data-size="sm"]').click();
    await expect(preview).toHaveAttribute('data-size', 'sm');

    await page.locator('[data-size-buttons] [data-size="lg"]').click();
    await expect(preview).toHaveAttribute('data-size', 'lg');

    await page.locator('[data-size-buttons] [data-size="md"]').click();
    // md is default → attribute removed.
    expect(await preview.getAttribute('data-size')).toBeNull();
  });
});

test.describe('Theme toggle', () => {
  test('flips html[data-theme] and persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const themeRoot = page.locator('#theme-select');

    await themeRoot.locator('[data-elu-trigger]').click();
    await themeRoot.locator('[data-elu-item][data-value="dark"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Restore.
    await themeRoot.locator('[data-elu-trigger]').click();
    await themeRoot.locator('[data-elu-item][data-value="light"]').click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Framework toggle (hero)', () => {
  test('changing hero-fw flips html[data-framework] and shows matching code panes', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const hero = page.locator('#hero-fw');

    await hero.locator('[data-elu-trigger]').click();
    await hero.locator('[data-elu-item][data-value="react"]').click();
    await expect(html).toHaveAttribute('data-framework', 'react');

    // Usage section: the react pane is the one that should currently be visible.
    const reactPane = page.locator('#usage [data-code-pane][data-framework="react"]').first();
    await expect(reactPane).toBeVisible();
  });
});
