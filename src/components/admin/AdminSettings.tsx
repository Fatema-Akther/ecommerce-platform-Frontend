import { useState } from 'react';
import { BaseAPI } from '@/lib/api/baseApi';
import { useSessionStore } from '@/stores/session'; // To get the current session user

const AdminSettings = () => {
  const { user } = useSessionStore();  // Fetch the currently logged-in user from session
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage("You must be logged in to change your details.");
      return;
    }
    try {
      const response = await BaseAPI.updateAdminEmailAndPassword(
        user.id,  // Send the logged-in user's ID
        newEmail, 
        newPassword
      );
      setMessage(response.message);
    } catch (error) {
      setMessage('Error updating email and password');
    }
  };

  return (
    <div>
      <h2>Change Admin Email and Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          New Email:
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Update</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminSettings;