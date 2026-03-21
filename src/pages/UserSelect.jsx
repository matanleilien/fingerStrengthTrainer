import { useState } from 'react';
import { getUsers, createUser, switchUser, deleteUser, renameUser } from '../utils/storage';
import './UserSelect.css';

export default function UserSelect({ onUserSelected }) {
  const [users, setUsers] = useState(getUsers);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const id = createUser(name);
    switchUser(id);
    onUserSelected(id);
  }

  function handleSelect(id) {
    switchUser(id);
    onUserSelected(id);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    const user = users.find(u => u.id === id);
    if (window.confirm(`Delete "${user.name}" and all their training data?`)) {
      deleteUser(id);
      setUsers(getUsers());
    }
  }

  function handleStartRename(e, user) {
    e.stopPropagation();
    setEditingId(user.id);
    setEditName(user.name);
  }

  function handleSaveRename(e) {
    e.stopPropagation();
    if (editName.trim()) {
      renameUser(editingId, editName.trim());
      setUsers(getUsers());
    }
    setEditingId(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSaveRename(e);
    if (e.key === 'Escape') setEditingId(null);
  }

  return (
    <div className="user-select">
      <div className="user-select-card">
        <h1>Finger Strength Trainer</h1>
        <p className="user-select-subtitle">Who's training today?</p>

        {users.length > 0 && (
          <div className="user-list">
            {users.map(user => (
              <div key={user.id} className="user-item" onClick={() => handleSelect(user.id)}>
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  {editingId === user.id ? (
                    <input
                      className="user-rename-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyDown={handleKeyDown}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="user-name">{user.name}</span>
                  )}
                </div>
                <div className="user-actions">
                  <button className="user-action-btn" onClick={(e) => handleStartRename(e, user)} title="Rename">
                    &#9998;
                  </button>
                  <button className="user-action-btn user-action-delete" onClick={(e) => handleDelete(e, user.id)} title="Delete">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="user-create">
          <h3>{users.length > 0 ? 'Add Another User' : 'Create Your Profile'}</h3>
          <div className="user-create-row">
            <input
              className="user-name-input"
              placeholder="Enter name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={30}
            />
            <button
              className="btn-primary user-create-btn"
              disabled={!newName.trim()}
              onClick={handleCreate}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
