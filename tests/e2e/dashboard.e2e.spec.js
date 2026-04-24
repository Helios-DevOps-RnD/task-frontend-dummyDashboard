// @ts-check
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('./pages/DashboardPage');

/**
 * E2E Tests — Alur lengkap CRUD user dan load data.
 *
 * Test ini membutuhkan semua service berjalan:
 *   - Frontend  : http://localhost:3000
 *   - Backend Express : http://localhost:3001
 *   - Backend Pubsub  : http://localhost:3002
 *   - PostgreSQL
 *
 * Untuk skip E2E saat backend tidak tersedia: SKIP_E2E=true
 */

const SKIP_E2E = process.env.SKIP_E2E === 'true';

// Helper untuk generate data unik
function makeUserData(suffix = '') {
  const ts = Date.now();
  return {
    username: `e2e_${ts}${suffix}`,
    fullName: `E2E User ${ts}`,
    email: `e2e_${ts}${suffix}@example.com`,
    password: 'E2EPass123!',
  };
}

test.describe('E2E — Create User', () => {
  test.skip(SKIP_E2E, 'E2E tests dinonaktifkan via SKIP_E2E=true');

  /** @type {DashboardPage} */
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('harus berhasil membuat user baru dan menampilkan alert sukses', async ({ page }) => {
    const userData = makeUserData('_create');

    // Siapkan listener alert sebelum klik submit
    const alertPromise = dashboard.captureAlert();

    await dashboard.fillAndSubmitCreateUser(userData);

    const alertMessage = await alertPromise;
    expect(alertMessage).toContain('berhasil');
  });

  test('form harus dikosongkan setelah create user berhasil', async ({ page }) => {
    const userData = makeUserData('_clear');

    const alertPromise = dashboard.captureAlert();
    await dashboard.fillAndSubmitCreateUser(userData);
    await alertPromise;

    // Setelah submit berhasil, semua input harus kosong
    await expect(dashboard.createUsernameInput).toHaveValue('');
    await expect(dashboard.createFullNameInput).toHaveValue('');
    await expect(dashboard.createEmailInput).toHaveValue('');
    await expect(dashboard.createPasswordInput).toHaveValue('');
  });
});

test.describe('E2E — Get User By ID', () => {
  test.skip(SKIP_E2E, 'E2E tests dinonaktifkan via SKIP_E2E=true');

  /** @type {DashboardPage} */
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('harus menampilkan data user setelah search berdasarkan ID yang valid', async ({ page }) => {
    // Buat user dulu via API langsung agar test tidak bergantung pada UI create
    const ts = Date.now();
    const payload = {
      username: `e2e_get_${ts}`,
      full_name: `E2E Get ${ts}`,
      email_address: `e2e_get_${ts}@example.com`,
      password: 'E2EPass123!',
    };

    const pubsubUrl = process.env.PUBSUB_URL || 'http://localhost:3002';
    const createRes = await page.request.post(`${pubsubUrl}/api/users`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(createRes.status()).toBe(201);
    const { data: createdUser } = await createRes.json();

    // Sekarang cari via UI
    await dashboard.searchUserById(createdUser.id);

    // Tunggu hasil muncul
    const resultBox = page.locator('div').filter({ hasText: 'Username:' }).last();
    await expect(resultBox).toBeVisible({ timeout: 10_000 });
    await expect(resultBox).toContainText(payload.username);
  });

  test('harus menampilkan alert jika ID tidak ditemukan', async ({ page }) => {
    const alertPromise = dashboard.captureAlert();
    await dashboard.searchUserById(999999999);
    const alertMessage = await alertPromise;
    expect(alertMessage).toContain('tidak ditemukan');
  });
});

test.describe('E2E — Update User', () => {
  test.skip(SKIP_E2E, 'E2E tests dinonaktifkan via SKIP_E2E=true');

  /** @type {DashboardPage} */
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('harus berhasil mengupdate user dan menampilkan alert sukses', async ({ page }) => {
    // Buat user dulu
    const ts = Date.now();
    const pubsubUrl = process.env.PUBSUB_URL || 'http://localhost:3002';
    const createRes = await page.request.post(`${pubsubUrl}/api/users`, {
      data: {
        username: `e2e_upd_${ts}`,
        full_name: `E2E Update ${ts}`,
        email_address: `e2e_upd_${ts}@example.com`,
        password: 'E2EPass123!',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const { data: createdUser } = await createRes.json();

    const alertPromise = dashboard.captureAlert();
    await dashboard.fillAndSubmitUpdateUser({
      id: createdUser.id,
      username: `updated_${ts}`,
      fullName: 'Updated Name',
      email: `updated_${ts}@example.com`,
    });

    const alertMessage = await alertPromise;
    expect(alertMessage).toContain('berhasil diupdate');
  });
});

test.describe('E2E — Delete User', () => {
  test.skip(SKIP_E2E, 'E2E tests dinonaktifkan via SKIP_E2E=true');

  /** @type {DashboardPage} */
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('harus berhasil menghapus user dan menampilkan alert sukses', async ({ page }) => {
    // Buat user dulu
    const ts = Date.now();
    const pubsubUrl = process.env.PUBSUB_URL || 'http://localhost:3002';
    const createRes = await page.request.post(`${pubsubUrl}/api/users`, {
      data: {
        username: `e2e_del_${ts}`,
        full_name: `E2E Delete ${ts}`,
        email_address: `e2e_del_${ts}@example.com`,
        password: 'E2EPass123!',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const { data: createdUser } = await createRes.json();

    const alertPromise = dashboard.captureAlert();
    await dashboard.deleteUser(createdUser.id);

    const alertMessage = await alertPromise;
    expect(alertMessage).toContain('berhasil dihapus');
  });
});

test.describe('E2E — Load Data Tables', () => {
  test.skip(SKIP_E2E, 'E2E tests dinonaktifkan via SKIP_E2E=true');

  /** @type {DashboardPage} */
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('klik Load Data Users harus menampilkan tabel users', async ({ page }) => {
    await dashboard.loadUsersButton.click();

    // Tunggu tabel muncul
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Validasi header kolom ada
    await expect(table.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Username' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Email Address' })).toBeVisible();
  });

  test('klik Load Data Policy harus menampilkan tabel policy', async ({ page }) => {
    await dashboard.loadPoliciesButton.click();

    // Cari tabel yang berisi header "Title Name"
    const policyTable = page.locator('table').filter({
      has: page.getByRole('columnheader', { name: 'Title Name' }),
    });
    await expect(policyTable).toBeVisible({ timeout: 10_000 });
  });

  test('klik Load Data Devices harus menampilkan tabel devices', async ({ page }) => {
    await dashboard.loadDevicesButton.click();

    // Cari tabel yang berisi header "Serial Num"
    const deviceTable = page.locator('table').filter({
      has: page.getByRole('columnheader', { name: 'Serial Num' }),
    });
    await expect(deviceTable).toBeVisible({ timeout: 10_000 });
  });
});
