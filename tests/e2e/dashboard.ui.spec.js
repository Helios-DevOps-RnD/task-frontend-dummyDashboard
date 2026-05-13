// @ts-check
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('./pages/DashboardPage');

/**
 * UI Tests — Struktur dan tampilan halaman Dashboard.
 * Test ini tidak membutuhkan backend hidup; hanya memvalidasi
 * bahwa elemen-elemen UI ada dan terlihat dengan benar.
 */

test.describe('Dashboard — Tampilan UI', () => {
  /** @type {DashboardPage} */
  let dashboard;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('harus menampilkan judul Dashboard', async () => {
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.heading).toHaveText('Dashboard FE HMS');
  });

  test('harus menampilkan semua 10 section', async ({ page }) => {
    const sections = [
      '1. Add User',
      '2. Get User (Berdasarkan ID)',
      '3. Update Data User',
      '4. Delete User',
      '5. Upload File (Firebase)',
      '6. List FileName yang ada di Firebase',
      '7. Get Link File (Firebase)',
      '8. List Data Users (Semua Kolom)',
      '9. List Data Policy (Semua Kolom)',
      '10. List Data Devices (Semua Kolom)',
    ];

    for (const sectionTitle of sections) {
      await expect(page.getByRole('heading', { name: sectionTitle })).toBeVisible();
    }
  });

  test.describe('Section 1 — Add User form', () => {
    test('harus menampilkan semua input dan tombol', async () => {
      await expect(dashboard.createUsernameInput).toBeVisible();
      await expect(dashboard.createFullNameInput).toBeVisible();
      await expect(dashboard.createEmailInput).toBeVisible();
      await expect(dashboard.createPasswordInput).toBeVisible();
      await expect(dashboard.createUserButton).toBeVisible();
      await expect(dashboard.createUserButton).toBeEnabled();
    });

    test('input password harus bertipe password (tersembunyi)', async () => {
      await expect(dashboard.createPasswordInput).toHaveAttribute('type', 'password');
    });

    test('input email harus bertipe email', async () => {
      await expect(dashboard.createEmailInput).toHaveAttribute('type', 'email');
    });
  });

  test.describe('Section 2 — Get User By ID form', () => {
    test('harus menampilkan input ID dan tombol Search', async () => {
      await expect(dashboard.searchIdInput).toBeVisible();
      await expect(dashboard.searchUserButton).toBeVisible();
    });
  });

  test.describe('Section 3 — Update User form', () => {
    test('harus menampilkan semua input update dan tombol Save', async () => {
      await expect(dashboard.updateIdInput).toBeVisible();
      await expect(dashboard.updateUsernameInput).toBeVisible();
      await expect(dashboard.updateFullNameInput).toBeVisible();
      await expect(dashboard.updateEmailInput).toBeVisible();
      await expect(dashboard.saveUpdateButton).toBeVisible();
    });
  });

  test.describe('Section 4 — Delete User form', () => {
    test('harus menampilkan input ID dan tombol Delete', async () => {
      await expect(dashboard.deleteIdInput).toBeVisible();
      await expect(dashboard.deleteButton).toBeVisible();
    });
  });

  test.describe('Section 8, 9, 10 — Load Data buttons', () => {
    test('harus menampilkan tombol Load Data Users', async () => {
      await expect(dashboard.loadUsersButton).toBeVisible();
    });

    test('harus menampilkan tombol Load Data Policy', async () => {
      await expect(dashboard.loadPoliciesButton).toBeVisible();
    });

    test('harus menampilkan tombol Load Data Devices', async () => {
      await expect(dashboard.loadDevicesButton).toBeVisible();
    });
  });

  test('tabel users tidak boleh terlihat sebelum tombol Load diklik', async ({ page }) => {
    // Tabel hanya muncul setelah tombol diklik (state showUsers = false awalnya)
    const table = page.locator('table').first();
    await expect(table).not.toBeVisible();
  });
});
