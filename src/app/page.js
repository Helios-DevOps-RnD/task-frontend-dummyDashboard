'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  // Runtime env injection: values come from /public/env-config.js which is
  // (re)generated at container start by entrypoint.sh from the k8s ConfigMap.
  // Dev (`next dev`): public/env-config.js is committed with empty __ENV__,
  // so you can point to localhost by setting window.__ENV__ manually or just
  // hardcoding for local testing. In k8s, entrypoint.sh overwrites it.
  const API_URL =
    (typeof window !== 'undefined' && window.__ENV__?.API_URL) || '';
  const Create_URL =
    (typeof window !== 'undefined' && window.__ENV__?.CREATE_URL) || '';

  // State Users
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  // State Policy & Device
  const [policies, setPolicies] = useState([]);
  const [showPolicies, setShowPolicies] = useState(false);
  const [devices, setDevices] = useState([]);
  const [showDevices, setShowDevices] = useState(false);

  // State CRUD User
  const [createUsername, setCreateUsername] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createEmailAddress, setCreateEmailAddress] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  const [searchId, setSearchId] = useState('');
  const [foundUser, setFoundUser] = useState(null);

  const [updateId, setUpdateId] = useState('');
  const [updateUsername, setUpdateUsername] = useState('');
  const [updateFullName, setUpdateFullName] = useState('');
  const [updateEmailAddress, setUpdateEmailAddress] = useState('');
  
  const [deleteId, setDeleteId] = useState('');

  // State Firebase
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [searchFilename, setSearchFilename] = useState('');
  const [fetchedFileUrl, setFetchedFileUrl] = useState('');
  
  // State List Firebase Files
  const [firebaseFiles, setFirebaseFiles] = useState([]);
  const [showFirebaseFiles, setShowFirebaseFiles] = useState(false);

  // ==========================================
  // Function API CALLS
  // ==========================================
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data.data || []);
      setShowUsers(true);
    } catch (error) {
      alert("Gagal mengambil data users");
    }
  };

  // Create User via Pub/Sub
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${Create_URL}/api/users`,
        { username: createUsername, full_name: createFullName, email_address: createEmailAddress, password: createPassword });
      alert('User berhasil di buat!');

      setCreateUsername(''); 
      setCreateFullName(''); 
      setCreateEmailAddress(''); 
      setCreatePassword('');

      if (showUsers) fetchAllUsers(); 
    } catch (error) { 
      alert(error.response?.data?.message || 'Gagal membuat user'); 
    }
  };

  // Get User By ID
  const handleGetUserById = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${API_URL}/api/users/${searchId}`);
      setFoundUser(response.data.data); 
    } catch (error) {
      alert("User tidak ditemukan"); 
      setFoundUser(null);
    }
  };

  // Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/users/${updateId}`,
        { username: updateUsername, full_name: updateFullName, email_address: updateEmailAddress });
      alert(`User ID ${updateId} berhasil diupdate!`);
      setUpdateId(''); 
      setUpdateUsername(''); 
      setUpdateFullName(''); 
      setUpdateEmailAddress('');

      if (showUsers) fetchAllUsers();
    } catch (error) { 
      alert(error.response?.data?.message || 'Gagal mengupdate user.'); 
    }
  };

  // Delete User
  const handleDeleteUser = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`${API_URL}/api/users/${deleteId}`);
      alert(`User ID ${deleteId} berhasil dihapus!`);
      setDeleteId('');
      if (showUsers) fetchAllUsers();
    } catch (error) { 
      alert('Gagal menghapus user.'); 
    }
  };

  // Upload File ke Firebase
  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Pilih file dulu!');
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Upload Sukses!');
      setUploadedUrl(response.data.file_url || response.data.file_name); 
      if(showFirebaseFiles) fetchFirebaseFiles(); // Refresh list file otomatis
    } catch (error) { 
      alert('Gagal upload file'); 
    } 
    finally { 
      setUploadLoading(false); 
    }
  };

  // Get Link File dari Firebase berdasarkan nama file
  const handleGetFile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${API_URL}/api/file/${searchFilename}`);
      setFetchedFileUrl(response.data.file_url);
    } catch (error) {
      alert("File tidak ditemukan di Firebase"); 
      setFetchedFileUrl('');
    }
  };

  // Fetch list file yang ada di Firebase
  const fetchFirebaseFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/files`); // Butuh BE update
      setFirebaseFiles(response.data.data || []);
      setShowFirebaseFiles(true);
    } catch (error) {
      alert("Gagal mengambil list file Firebase.");
    }
  };

  // Fetch Policies
  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/policies`);
      setPolicies(response.data.data || []);
      setShowPolicies(true);
    } catch (error) { alert("Gagal mengambil data policy."); }
  };

  // Fetch Devices
  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/devices`);
      setDevices(response.data.data || []);
      setShowDevices(true);
    } catch (error) { alert("Gagal mengambil data device."); }
  };

  // Helper untuk menampilkan tanggal biar nggak error kalau null
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

//=========================================
  // RENDER UI
  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-black underline">Dashboard FE HMS</h1>

        {/* 1. Create User */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <h2 className="text-lg font-bold mb-3 text-black">1. Add User</h2>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <input type="text" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Username..." />
            <input type="text" value={createFullName} onChange={(e) => setCreateFullName(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Full Name..." />
            <input type="email" value={createEmailAddress} onChange={(e) => setCreateEmailAddress(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Email Address..." />
            <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Password..." />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">Create User</button>
          </form>
        </div>

        {/* 2. Get User By ID  */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <h2 className="text-lg font-bold mb-3 text-black">2. Get User (Berdasarkan ID)</h2>
          <form onSubmit={handleGetUserById} className="space-y-3">
            <input type="number" value={searchId} onChange={(e) => setSearchId(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Masukkan ID User..." />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">Search User</button>
          </form>
          {foundUser && (
            <div className="mt-3 p-3 bg-gray-50 text-sm rounded border border-gray-200">
              <p><strong>Username:</strong> {foundUser.username || '-'}</p>
              <p><strong>Full Name:</strong> {foundUser.full_name || '-'}</p>
              <p><strong>Email:</strong> {foundUser.email_address || '-'}</p>
            </div>
          )}
        </div>

        {/* 3. Update User */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <h2 className="text-lg font-bold mb-3 text-black">3. Update Data User</h2>
          <form onSubmit={handleUpdateUser} className="space-y-3">
            <input type="number" value={updateId} onChange={(e) => setUpdateId(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="ID User yang mau diubah..." />
            <input type="text" value={updateUsername} onChange={(e) => setUpdateUsername(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Username Baru..." />
            <input type="text" value={updateFullName} onChange={(e) => setUpdateFullName(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Full Name Baru..." />
            <input type="email" value={updateEmailAddress} onChange={(e) => setUpdateEmailAddress(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Email Address Baru..." />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">Save Update</button>
          </form>
        </div>

        {/* 4. Delete User */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <h2 className="text-lg font-bold mb-3 text-black">4. Delete User</h2>
          <form onSubmit={handleDeleteUser} className="space-y-3">
            <input type="number" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="ID User yang akan dihapus..." />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">Delete</button>
          </form>
        </div>

        {/* 5. Upload File Firebase */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <h2 className="text-lg font-bold mb-3 text-black">5. Upload File (Firebase)</h2>
          <form onSubmit={handleUploadFile} className="space-y-3">
            <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none" />
            <button type="submit" disabled={uploadLoading} className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-400">
              {uploadLoading ? 'Mengunggah...' : 'Upload'}
            </button>
          </form>
          {uploadedUrl && (
            <div className="mt-3 p-3 bg-gray-50 text-sm rounded border border-gray-200 break-all">
              <p className="font-bold text-black">Berhasil! Link/Nama File:</p>
              <a href={uploadedUrl} target="_blank" className="text-blue-600 hover:underline">{uploadedUrl}</a>
            </div>
          )}
        </div>

        {/* 6. List File Firebase */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">6. List FileName yang ada di Firebase</h2>
            <button onClick={fetchFirebaseFiles} className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-blue-700 transition">Show File</button>
          </div>
          {showFirebaseFiles && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm max-h-48 overflow-y-auto">
              {firebaseFiles.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {firebaseFiles.map((fileName, idx) => (
                    <li key={idx} className="text-black">
                      {fileName} 
                      <button onClick={() => setSearchFilename(fileName)} className="ml-2 text-blue-600 hover:underline text-xs">(Pilih File Ini)</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Tidak ada file atau gagal memuat.</p>
              )}
            </div>
          )}
        </div>

        {/* 7. Get File Firebase */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <h2 className="text-lg font-bold mb-3 text-black">7. Get Link File (Firebase)</h2>
          <form onSubmit={handleGetFile} className="space-y-3">
            <input type="text" value={searchFilename} onChange={(e) => setSearchFilename(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Ketik atau pilih nama file dari list di atas..." />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">Get Link Download</button>
          </form>
          {fetchedFileUrl && (
            <div className="mt-3 p-3 bg-gray-50 text-sm rounded border border-gray-200 break-all">
              <p className="font-bold text-black">Link File Ditemukan:</p>
              <a href={fetchedFileUrl} target="_blank" className="text-blue-600 hover:underline">{fetchedFileUrl}</a>
            </div>
          )}
        </div>

        {/* 8. Tabel Users (Semua Kolom) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">8. List Data Users (Semua Kolom)</h2>
            <button onClick={fetchAllUsers} className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-blue-700 transition">Load Data Users</button>
          </div>
          {showUsers && (
            <div className="overflow-x-auto border border-gray-300 rounded">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-black">
                    <th className="p-2 font-bold border-r border-gray-200">ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Username</th>
                    <th className="p-2 font-bold border-r border-gray-200">Password</th>
                    <th className="p-2 font-bold border-r border-gray-200">Full Name</th>
                    <th className="p-2 font-bold border-r border-gray-200">Tenant ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Create At</th>
                    <th className="p-2 font-bold border-r border-gray-200">Update At</th>
                    <th className="p-2 font-bold border-r border-gray-200">Email Address</th>
                    <th className="p-2 font-bold border-r border-gray-200">Type</th>
                    <th className="p-2 font-bold border-r border-gray-200">Status AD</th>
                    <th className="p-2 font-bold border-r border-gray-200">Custom Attr 1</th>
                    <th className="p-2 font-bold border-r border-gray-200">Custom Attr 2</th>
                    <th className="p-2 font-bold border-r border-gray-200">Custom Attr 3</th>
                    <th className="p-2 font-bold">JSON String Attr</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 border-r border-gray-200">{u.id}</td>
                      <td className="p-2 border-r border-gray-200">{u.username || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.password || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.full_name || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.tenant_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{formatDate(u.create_at)}</td>
                      <td className="p-2 border-r border-gray-200">{formatDate(u.update_at)}</td>
                      <td className="p-2 border-r border-gray-200">{u.email_address || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.type ?? '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.status_ad ?? '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.custom_attribute_1 || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.custom_attribute_2 || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{u.custom_attribute_3 || '-'}</td>
                      <td className="p-2">{u.json_string_attribute || '-'}</td>
                    </tr>
                  )) : <tr><td colSpan="14" className="p-3 text-center text-gray-500">Data kosong</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 9. Tabel Policy (Semua Kolom) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">9. List Data Policy (Semua Kolom)</h2>
            <button onClick={fetchPolicies} className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-blue-700 transition">Load Data Policy</button>
          </div>
          {showPolicies && (
            <div className="overflow-x-auto border border-gray-300 rounded">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-black">
                    <th className="p-2 font-bold border-r border-gray-200">ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Tenant ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Title Name</th>
                    <th className="p-2 font-bold border-r border-gray-200">Description</th>
                    <th className="p-2 font-bold border-r border-gray-200">Apps Bundle ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Create At</th>
                    <th className="p-2 font-bold border-r border-gray-200">Update At</th>
                    <th className="p-2 font-bold border-r border-gray-200">Geofencing ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Rules Type</th>
                    <th className="p-2 font-bold border-r border-gray-200">Exec Out of Geofencing</th>
                    <th className="p-2 font-bold border-r border-gray-200">Notification</th>
                    <th className="p-2 font-bold">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length > 0 ? policies.map((p) => (
                    <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 border-r border-gray-200">{p.id}</td>
                      <td className="p-2 border-r border-gray-200">{p.tenant_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{p.title_name || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{p.description || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{p.apps_bundle_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{formatDate(p.create_at)}</td>
                      <td className="p-2 border-r border-gray-200">{formatDate(p.update_at)}</td>
                      <td className="p-2 border-r border-gray-200">{p.geofencing_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{p.rules_type || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{p.execute_out_of_geofencing || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{p.notification || '-'}</td>
                      <td className="p-2">{p.message || '-'}</td>
                    </tr>
                  )) : <tr><td colSpan="12" className="p-3 text-center text-gray-500">Data kosong</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 10. Tabel Device (Semua Kolom) */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">10. List Data Devices (Semua Kolom)</h2>
            <button onClick={fetchDevices} className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-blue-700 transition">Load Data Devices</button>
          </div>
          {showDevices && (
            <div className="overflow-x-auto border border-gray-300 rounded">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-black">
                    <th className="p-2 font-bold border-r border-gray-200">ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">ID FCM</th>
                    <th className="p-2 font-bold border-r border-gray-200">Serial Num</th>
                    <th className="p-2 font-bold border-r border-gray-200">Model</th>
                    <th className="p-2 font-bold border-r border-gray-200">Status</th>
                    <th className="p-2 font-bold border-r border-gray-200">Licence ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Tenant ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Create At</th>
                    <th className="p-2 font-bold border-r border-gray-200">Update At</th>
                    <th className="p-2 font-bold border-r border-gray-200">User ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Enterprise Device ID</th>
                    <th className="p-2 font-bold border-r border-gray-200">Serial Num Manufacture</th>
                    <th className="p-2 font-bold border-r border-gray-200">Enterprise Policy Name</th>
                    <th className="p-2 font-bold">Enterprise Enrollment Time</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.length > 0 ? devices.map((d) => (
                    <tr key={d.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 border-r border-gray-200">{d.id}</td>
                      <td className="p-2 border-r border-gray-200 whitespace-normal break-all min-w-[200px] max-w-[300px]">{d.id_fcm || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.serial_num || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.model || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.status ?? '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.licence_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.tenant_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{formatDate(d.create_at)}</td>
                      <td className="p-2 border-r border-gray-200">{formatDate(d.update_at)}</td>
                      <td className="p-2 border-r border-gray-200">{d.user_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.enterprise_device_id || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.serial_number_manufacture || '-'}</td>
                      <td className="p-2 border-r border-gray-200">{d.enterprise_policy_name || '-'}</td>
                      <td className="p-2">{formatDate(d.enterprise_enrollment_time)}</td>
                    </tr>
                  )) : <tr><td colSpan="14" className="p-3 text-center text-gray-500">Data kosong</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}