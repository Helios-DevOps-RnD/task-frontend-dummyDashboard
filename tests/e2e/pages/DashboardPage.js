// @ts-check

/**
 * Page Object Model untuk halaman Dashboard.
 * Memusatkan semua selector dan aksi UI di satu tempat
 * agar test lebih mudah dibaca dan dirawat.
 */
class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // ── Heading ──────────────────────────────────────────────────────────────
    this.heading = page.getByRole('heading', { name: 'Dashboard' });

    // ── Section 1: Add User ───────────────────────────────────────────────────
    this.addUserSection = page.getByRole('heading', { name: '1. Add User' });
    this.createUsernameInput = page.getByPlaceholder('Username...');
    this.createFullNameInput = page.getByPlaceholder('Full Name...');
    this.createEmailInput = page.getByPlaceholder('Email Address...');
    this.createPasswordInput = page.getByPlaceholder('Password...');
    this.createUserButton = page.getByRole('button', { name: 'Create User' });

    // ── Section 2: Get User By ID ─────────────────────────────────────────────
    this.getUserSection = page.getByRole('heading', { name: '2. Get User (Berdasarkan ID)' });
    this.searchIdInput = page.getByPlaceholder('Masukkan ID User...');
    this.searchUserButton = page.getByRole('button', { name: 'Search User' });

    // ── Section 3: Update User ────────────────────────────────────────────────
    this.updateUserSection = page.getByRole('heading', { name: '3. Update Data User' });
    this.updateIdInput = page.getByPlaceholder('ID User yang mau diubah...');
    this.updateUsernameInput = page.getByPlaceholder('Username Baru...');
    this.updateFullNameInput = page.getByPlaceholder('Full Name Baru...');
    this.updateEmailInput = page.getByPlaceholder('Email Address Baru...');
    this.saveUpdateButton = page.getByRole('button', { name: 'Save Update' });

    // ── Section 4: Delete User ────────────────────────────────────────────────
    this.deleteUserSection = page.getByRole('heading', { name: '4. Delete User' });
    this.deleteIdInput = page.getByPlaceholder('ID User yang akan dihapus...');
    this.deleteButton = page.getByRole('button', { name: 'Delete' });

    // ── Section 8: List Users ─────────────────────────────────────────────────
    this.loadUsersButton = page.getByRole('button', { name: 'Load Data Users' });

    // ── Section 9: List Policy ────────────────────────────────────────────────
    this.loadPoliciesButton = page.getByRole('button', { name: 'Load Data Policy' });

    // ── Section 10: List Devices ──────────────────────────────────────────────
    this.loadDevicesButton = page.getByRole('button', { name: 'Load Data Devices' });

    // ── Section 6: Firebase Files ─────────────────────────────────────────────
    this.showFirebaseFilesButton = page.getByRole('button', { name: 'Show File' });
  }

  /** Navigasi ke halaman utama */
  async goto() {
    await this.page.goto('/');
    await this.heading.waitFor({ state: 'visible' });
  }

  /**
   * Isi dan submit form Add User.
   * @param {{ username: string, fullName: string, email: string, password: string }} data
   */
  async fillAndSubmitCreateUser({ username, fullName, email, password }) {
    await this.createUsernameInput.fill(username);
    await this.createFullNameInput.fill(fullName);
    await this.createEmailInput.fill(email);
    await this.createPasswordInput.fill(password);
    await this.createUserButton.click();
  }

  /**
   * Cari user berdasarkan ID.
   * @param {string|number} id
   */
  async searchUserById(id) {
    await this.searchIdInput.fill(String(id));
    await this.searchUserButton.click();
  }

  /**
   * Isi dan submit form Update User.
   * @param {{ id: string|number, username: string, fullName: string, email: string }} data
   */
  async fillAndSubmitUpdateUser({ id, username, fullName, email }) {
    await this.updateIdInput.fill(String(id));
    await this.updateUsernameInput.fill(username);
    await this.updateFullNameInput.fill(fullName);
    await this.updateEmailInput.fill(email);
    await this.saveUpdateButton.click();
  }

  /**
   * Isi dan submit form Delete User.
   * @param {string|number} id
   */
  async deleteUser(id) {
    await this.deleteIdInput.fill(String(id));
    await this.deleteButton.click();
  }

  /**
   * Tangkap dan dismiss dialog alert browser.
   * Mengembalikan teks pesan alert.
   * @returns {Promise<string>}
   */
  async captureAlert() {
    return new Promise((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });
  }
}

module.exports = { DashboardPage };
