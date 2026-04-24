import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import Home from '../../src/app/page'

jest.mock('axios')

describe('Home Component - Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.alert = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the dashboard title', () => {
      render(<Home />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render all main sections', () => {
      render(<Home />)
      expect(screen.getByText('1. Add User')).toBeInTheDocument()
      expect(screen.getByText('2. Get User (Berdasarkan ID)')).toBeInTheDocument()
      expect(screen.getByText('3. Update Data User')).toBeInTheDocument()
      expect(screen.getByText('4. Delete User')).toBeInTheDocument()
      expect(screen.getByText('5. Upload File (Firebase)')).toBeInTheDocument()
      expect(screen.getByText('6. List FileName yang ada di Firebase')).toBeInTheDocument()
      expect(screen.getByText('7. Get Link File (Firebase)')).toBeInTheDocument()
      expect(screen.getByText('8. List Data Users (Semua Kolom)')).toBeInTheDocument()
      expect(screen.getByText('9. List Data Policy (Semua Kolom)')).toBeInTheDocument()
      expect(screen.getByText('10. List Data Devices (Semua Kolom)')).toBeInTheDocument()
    })

    it('should render all form inputs for creating user', () => {
      render(<Home />)
      const inputs = screen.getAllByPlaceholderText(/Username|Full Name|Email Address|Password/)
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('User CRUD Operations', () => {
    describe('Create User', () => {
      it('should successfully create a user', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } })
        render(<Home />)

        const inputs = screen.getAllByPlaceholderText(/Username|Full Name|Email Address|Password/)
        const usernameInput = inputs[0]
        const fullNameInput = inputs[1]
        const emailInput = inputs[2]
        const passwordInput = inputs[3]

        await userEvent.type(usernameInput, 'testuser')
        await userEvent.type(fullNameInput, 'Test User')
        await userEvent.type(emailInput, 'test@example.com')
        await userEvent.type(passwordInput, 'password123')

        const createButton = screen.getAllByRole('button', { name: /Create User/i })[0]
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/users'),
            {
              username: 'testuser',
              full_name: 'Test User',
              email_address: 'test@example.com',
              password: 'password123',
            }
          )
        })

        expect(global.alert).toHaveBeenCalledWith('User berhasil di buat!')
      })

      it('should handle create user error', async () => {
        axios.post.mockRejectedValueOnce({
          response: { data: { message: 'Username already exists' } },
        })
        render(<Home />)

        const inputs = screen.getAllByPlaceholderText(/Username|Full Name|Email Address|Password/)
        await userEvent.type(inputs[0], 'testuser')
        await userEvent.type(inputs[1], 'Test User')
        await userEvent.type(inputs[2], 'test@example.com')
        await userEvent.type(inputs[3], 'password123')

        const createButton = screen.getAllByRole('button', { name: /Create User/i })[0]
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Username already exists')
        })
      })

      it('should clear form after successful user creation', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } })
        render(<Home />)

        const inputs = screen.getAllByPlaceholderText(/Username|Full Name|Email Address|Password/)
        await userEvent.type(inputs[0], 'testuser')
        await userEvent.type(inputs[1], 'Test User')
        await userEvent.type(inputs[2], 'test@example.com')
        await userEvent.type(inputs[3], 'password123')

        const createButton = screen.getAllByRole('button', { name: /Create User/i })[0]
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(inputs[0].value).toBe('')
          expect(inputs[1].value).toBe('')
          expect(inputs[2].value).toBe('')
          expect(inputs[3].value).toBe('')
        })
      })
    })

    describe('Get User By ID', () => {
      it('should fetch and display user by ID', async () => {
        const mockUser = {
          id: 1,
          username: 'testuser',
          full_name: 'Test User',
          email_address: 'test@example.com',
        }
        axios.get.mockResolvedValueOnce({ data: { data: mockUser } })
        render(<Home />)

        const searchInput = screen.getByPlaceholderText('Masukkan ID User...')
        await userEvent.type(searchInput, '1')

        const searchButton = screen.getAllByRole('button', { name: /Search User/i })[0]
        fireEvent.click(searchButton)

        await waitFor(() => {
          expect(screen.getByText(/testuser/)).toBeInTheDocument()
          expect(screen.getByText(/Test User/)).toBeInTheDocument()
          expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
        })
      })

      it('should handle user not found error', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 404 } })
        render(<Home />)

        const searchInput = screen.getByPlaceholderText('Masukkan ID User...')
        await userEvent.type(searchInput, '999')

        const searchButton = screen.getAllByRole('button', { name: /Search User/i })[0]
        fireEvent.click(searchButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('User tidak ditemukan')
        })
      })
    })

    describe('Update User', () => {
      it('should successfully update user', async () => {
        axios.put.mockResolvedValueOnce({ data: { success: true } })
        render(<Home />)

        const updateSection = screen.getByText('3. Update Data User').closest('div')
        const inputs = within(updateSection).getAllByRole('textbox')

        await userEvent.type(inputs[0], '1')
        await userEvent.type(inputs[1], 'newusername')
        await userEvent.type(inputs[2], 'New Full Name')
        await userEvent.type(inputs[3], 'newemail@example.com')

        const updateButton = within(updateSection).getByRole('button', { name: /Save Update/i })
        fireEvent.click(updateButton)

        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('/api/users/1'),
            {
              username: 'newusername',
              full_name: 'New Full Name',
              email_address: 'newemail@example.com',
            }
          )
        })

        expect(global.alert).toHaveBeenCalledWith('User ID 1 berhasil diupdate!')
      })

      it('should handle update user error', async () => {
        axios.put.mockRejectedValueOnce({
          response: { data: { message: 'User not found' } },
        })
        render(<Home />)

        const updateSection = screen.getByText('3. Update Data User').closest('div')
        const inputs = within(updateSection).getAllByRole('textbox')

        await userEvent.type(inputs[0], '999')
        await userEvent.type(inputs[1], 'newusername')
        await userEvent.type(inputs[2], 'New Full Name')
        await userEvent.type(inputs[3], 'newemail@example.com')

        const updateButton = within(updateSection).getByRole('button', { name: /Save Update/i })
        fireEvent.click(updateButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('User not found')
        })
      })
    })

    describe('Delete User', () => {
      it('should successfully delete user', async () => {
        axios.delete.mockResolvedValueOnce({ data: { success: true } })
        render(<Home />)

        const deleteSection = screen.getByText('4. Delete User').closest('div')
        const deleteInput = within(deleteSection).getByPlaceholderText('ID User yang akan dihapus...')
        await userEvent.type(deleteInput, '1')

        const deleteButton = within(deleteSection).getByRole('button', { name: /Delete/i })
        fireEvent.click(deleteButton)

        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/users/1'))
        })

        expect(global.alert).toHaveBeenCalledWith('User ID 1 berhasil dihapus!')
      })

      it('should handle delete user error', async () => {
        axios.delete.mockRejectedValueOnce({ response: { status: 404 } })
        render(<Home />)

        const deleteSection = screen.getByText('4. Delete User').closest('div')
        const deleteInput = within(deleteSection).getByPlaceholderText('ID User yang akan dihapus...')
        await userEvent.type(deleteInput, '999')

        const deleteButton = within(deleteSection).getByRole('button', { name: /Delete/i })
        fireEvent.click(deleteButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal menghapus user.')
        })
      })
    })
  })

  describe('Firebase File Operations', () => {
    describe('Upload File', () => {
      it('should successfully upload file', async () => {
        axios.post.mockResolvedValueOnce({
          data: { file_url: 'https://firebase.com/file.pdf' },
        })
        render(<Home />)

        const fileInput = screen.getByRole('textbox', { hidden: true })
        const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

        fireEvent.change(fileInput, { target: { files: [file] } })

        const uploadButton = screen.getAllByRole('button', { name: /Upload/i })[0]
        fireEvent.click(uploadButton)

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/upload'),
            expect.any(FormData),
            expect.objectContaining({
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          )
        })

        expect(global.alert).toHaveBeenCalledWith('Upload Sukses!')
      })

      it('should show error when no file selected', async () => {
        render(<Home />)

        const uploadButton = screen.getAllByRole('button', { name: /Upload/i })[0]
        fireEvent.click(uploadButton)

        expect(global.alert).toHaveBeenCalledWith('Pilih file dulu!')
      })

      it('should handle upload error', async () => {
        axios.post.mockRejectedValueOnce({ response: { status: 500 } })
        render(<Home />)

        const fileInput = screen.getByRole('textbox', { hidden: true })
        const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

        fireEvent.change(fileInput, { target: { files: [file] } })

        const uploadButton = screen.getAllByRole('button', { name: /Upload/i })[0]
        fireEvent.click(uploadButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal upload file')
        })
      })
    })

    describe('Get File', () => {
      it('should fetch file URL successfully', async () => {
        axios.get.mockResolvedValueOnce({
          data: { file_url: 'https://firebase.com/file.pdf' },
        })
        render(<Home />)

        const fileSearchInput = screen.getByPlaceholderText(
          'Ketik atau pilih nama file dari list di atas...'
        )
        await userEvent.type(fileSearchInput, 'test.pdf')

        const getFileButton = screen.getAllByRole('button', { name: /Get Link Download/i })[0]
        fireEvent.click(getFileButton)

        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/api/file/test.pdf')
          )
        })

        expect(screen.getByText(/Link File Ditemukan:/)).toBeInTheDocument()
      })

      it('should handle file not found error', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 404 } })
        render(<Home />)

        const fileSearchInput = screen.getByPlaceholderText(
          'Ketik atau pilih nama file dari list di atas...'
        )
        await userEvent.type(fileSearchInput, 'nonexistent.pdf')

        const getFileButton = screen.getAllByRole('button', { name: /Get Link Download/i })[0]
        fireEvent.click(getFileButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('File tidak ditemukan di Firebase')
        })
      })
    })

    describe('List Firebase Files', () => {
      it('should fetch and display firebase files', async () => {
        axios.get.mockResolvedValueOnce({
          data: { data: ['file1.pdf', 'file2.pdf', 'file3.pdf'] },
        })
        render(<Home />)

        const showFileButton = screen.getAllByRole('button', { name: /Show File/i })[0]
        fireEvent.click(showFileButton)

        await waitFor(() => {
          expect(screen.getByText('file1.pdf')).toBeInTheDocument()
          expect(screen.getByText('file2.pdf')).toBeInTheDocument()
          expect(screen.getByText('file3.pdf')).toBeInTheDocument()
        })
      })

      it('should handle firebase files fetch error', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 500 } })
        render(<Home />)

        const showFileButton = screen.getAllByRole('button', { name: /Show File/i })[0]
        fireEvent.click(showFileButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal mengambil list file Firebase.')
        })
      })
    })
  })

  describe('Data Fetching Operations', () => {
    describe('Fetch All Users', () => {
      it('should fetch and display all users', async () => {
        const mockUsers = [
          {
            id: 1,
            username: 'user1',
            full_name: 'User One',
            email_address: 'user1@example.com',
            create_at: '2024-01-01T00:00:00Z',
            update_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            username: 'user2',
            full_name: 'User Two',
            email_address: 'user2@example.com',
            create_at: '2024-01-02T00:00:00Z',
            update_at: '2024-01-02T00:00:00Z',
          },
        ]
        axios.get.mockResolvedValueOnce({ data: { data: mockUsers } })
        render(<Home />)

        const loadUsersButton = screen.getAllByRole('button', { name: /Load Data Users/i })[0]
        fireEvent.click(loadUsersButton)

        await waitFor(() => {
          expect(screen.getByText('user1')).toBeInTheDocument()
          expect(screen.getByText('user2')).toBeInTheDocument()
        })
      })

      it('should handle fetch users error', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 500 } })
        render(<Home />)

        const loadUsersButton = screen.getAllByRole('button', { name: /Load Data Users/i })[0]
        fireEvent.click(loadUsersButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal mengambil data users')
        })
      })
    })

    describe('Fetch Policies', () => {
      it('should fetch and display policies', async () => {
        const mockPolicies = [
          {
            id: 1,
            title_name: 'Policy 1',
            description: 'Test Policy',
            create_at: '2024-01-01T00:00:00Z',
            update_at: '2024-01-01T00:00:00Z',
          },
        ]
        axios.get.mockResolvedValueOnce({ data: { data: mockPolicies } })
        render(<Home />)

        const loadPoliciesButton = screen.getAllByRole('button', { name: /Load Data Policy/i })[0]
        fireEvent.click(loadPoliciesButton)

        await waitFor(() => {
          expect(screen.getByText('Policy 1')).toBeInTheDocument()
        })
      })

      it('should handle fetch policies error', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 500 } })
        render(<Home />)

        const loadPoliciesButton = screen.getAllByRole('button', { name: /Load Data Policy/i })[0]
        fireEvent.click(loadPoliciesButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal mengambil data policy.')
        })
      })
    })

    describe('Fetch Devices', () => {
      it('should fetch and display devices', async () => {
        const mockDevices = [
          {
            id: 1,
            serial_num: 'SN123',
            model: 'Model X',
            status: 'active',
            create_at: '2024-01-01T00:00:00Z',
            update_at: '2024-01-01T00:00:00Z',
          },
        ]
        axios.get.mockResolvedValueOnce({ data: { data: mockDevices } })
        render(<Home />)

        const loadDevicesButton = screen.getAllByRole('button', { name: /Load Data Devices/i })[0]
        fireEvent.click(loadDevicesButton)

        await waitFor(() => {
          expect(screen.getByText('SN123')).toBeInTheDocument()
        })
      })

      it('should handle fetch devices error', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 500 } })
        render(<Home />)

        const loadDevicesButton = screen.getAllByRole('button', { name: /Load Data Devices/i })[0]
        fireEvent.click(loadDevicesButton)

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal mengambil data device.')
        })
      })
    })
  })

  describe('Utility Functions', () => {
    it('should format date correctly', () => {
      render(<Home />)
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          full_name: 'User One',
          email_address: 'user1@example.com',
          create_at: '2024-01-15T10:30:00Z',
          update_at: null,
        },
      ]
      axios.get.mockResolvedValueOnce({ data: { data: mockUsers } })

      const loadUsersButton = screen.getAllByRole('button', { name: /Load Data Users/i })[0]
      fireEvent.click(loadUsersButton)

      waitFor(() => {
        const dateElements = screen.getAllByText(/2024/)
        expect(dateElements.length).toBeGreaterThan(0)
      })
    })

    it('should display dash for null dates', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          full_name: 'User One',
          email_address: 'user1@example.com',
          create_at: null,
          update_at: null,
        },
      ]
      axios.get.mockResolvedValueOnce({ data: { data: mockUsers } })
      render(<Home />)

      const loadUsersButton = screen.getAllByRole('button', { name: /Load Data Users/i })[0]
      fireEvent.click(loadUsersButton)

      await waitFor(() => {
        const dashElements = screen.getAllByText('-')
        expect(dashElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Form Validation', () => {
    it('should require all fields in create user form', () => {
      render(<Home />)
      const inputs = screen.getAllByPlaceholderText(/Username|Full Name|Email Address|Password/)
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('required')
      })
    })

    it('should require email field to be email type', () => {
      render(<Home />)
      const emailInputs = screen.getAllByPlaceholderText(/Email Address/)
      emailInputs.forEach((input) => {
        expect(input).toHaveAttribute('type', 'email')
      })
    })

    it('should require password field to be password type', () => {
      render(<Home />)
      const passwordInputs = screen.getAllByPlaceholderText(/Password/)
      passwordInputs.forEach((input) => {
        expect(input).toHaveAttribute('type', 'password')
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during file upload', async () => {
      axios.post.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { file_url: 'url' } }), 100)
          )
      )
      render(<Home />)

      const fileInput = screen.getByRole('textbox', { hidden: true })
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      fireEvent.change(fileInput, { target: { files: [file] } })

      const uploadButton = screen.getAllByRole('button', { name: /Upload/i })[0]
      fireEvent.click(uploadButton)

      await waitFor(() => {
        expect(uploadButton).toHaveAttribute('disabled')
      })
    })
  })
})
