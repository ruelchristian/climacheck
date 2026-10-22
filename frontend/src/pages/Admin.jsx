import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const CONDITIONS = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Thunderstorm', 'Snow', 'Mist', 'Any'];

const emptyActivity = {
  category_id: '', name: '', description: '',
  min_temp_c: -10, max_temp_c: 40, weather_conditions: 'Any',
  max_precip_probability: 100, setting: 'both',
};

export default function Admin() {
  const [tab, setTab] = useState('activities');
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newActivity, setNewActivity] = useState(emptyActivity);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadAll() {
    try {
      const [catData, actData, userData] = await Promise.all([
        api.get('/categories'),
        api.get('/activities'),
        api.get('/admin/users'),
      ]);
      setCategories(catData.categories);
      setActivities(actData.activities);
      setUsers(userData.users);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleAddCategory(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/categories', newCategory);
      setNewCategory({ name: '', description: '' });
      setMessage('Category added.');
      loadAll();
    } catch (err) { setError(err.message); }
  }

  async function handleDeleteCategory(id) {
    await api.del(`/categories/${id}`);
    loadAll();
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/activities', newActivity);
      setNewActivity(emptyActivity);
      setMessage('Activity added.');
      loadAll();
    } catch (err) { setError(err.message); }
  }

  async function handleDeleteActivity(id) {
    await api.del(`/activities/${id}`);
    loadAll();
  }

  async function handleToggleRole(user) {
    const newRole = user.role === 'content_manager' ? 'user' : 'content_manager';
    await api.put(`/admin/users/${user.id}/role`, { role: newRole });
    loadAll();
  }

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <div className="tabs">
        <button className={tab === 'activities' ? 'tab active' : 'tab'} onClick={() => setTab('activities')}>Activities</button>
        <button className={tab === 'categories' ? 'tab active' : 'tab'} onClick={() => setTab('categories')}>Categories</button>
        <button className={tab === 'users' ? 'tab active' : 'tab'} onClick={() => setTab('users')}>Users</button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {tab === 'categories' && (
        <div>
          <form onSubmit={handleAddCategory} className="card form">
            <h3>Add Category</h3>
            <label>Name</label>
            <input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
            <label>Description</label>
            <input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
            <button type="submit">Add Category</button>
          </form>
          <ul className="list">
            {categories.map((c) => (
              <li key={c.id} className="list-item">
                <span><strong>{c.name}</strong> — {c.description}</span>
                <button className="btn-link" onClick={() => handleDeleteCategory(c.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'activities' && (
        <div>
          <form onSubmit={handleAddActivity} className="card form">
            <h3>Add Activity</h3>
            <label>Category</label>
            <select value={newActivity.category_id} onChange={(e) => setNewActivity({ ...newActivity, category_id: e.target.value })} required>
              <option value="">-- select --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label>Name</label>
            <input value={newActivity.name} onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })} required />
            <label>Description</label>
            <input value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
            <div className="form-row">
              <div>
                <label>Min Temp (°C)</label>
                <input type="number" value={newActivity.min_temp_c} onChange={(e) => setNewActivity({ ...newActivity, min_temp_c: e.target.value })} />
              </div>
              <div>
                <label>Max Temp (°C)</label>
                <input type="number" value={newActivity.max_temp_c} onChange={(e) => setNewActivity({ ...newActivity, max_temp_c: e.target.value })} />
              </div>
            </div>
            <label>Weather Conditions (comma-separated)</label>
            <input value={newActivity.weather_conditions} onChange={(e) => setNewActivity({ ...newActivity, weather_conditions: e.target.value })} placeholder="e.g. Clear,Clouds" />
            <p className="hint">Options: {CONDITIONS.join(', ')}</p>
            <label>Max Precipitation Probability (%)</label>
            <input type="number" min="0" max="100" value={newActivity.max_precip_probability} onChange={(e) => setNewActivity({ ...newActivity, max_precip_probability: e.target.value })} />
            <label>Setting</label>
            <select value={newActivity.setting} onChange={(e) => setNewActivity({ ...newActivity, setting: e.target.value })}>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="both">Both</option>
            </select>
            <button type="submit">Add Activity</button>
          </form>

          <ul className="list">
            {activities.map((a) => (
              <li key={a.id} className="list-item">
                <span><strong>{a.name}</strong> ({a.category_name}) — {a.min_temp_c}°C to {a.max_temp_c}°C, {a.weather_conditions}</span>
                <button className="btn-link" onClick={() => handleDeleteActivity(a.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'users' && (
        <ul className="list">
          {users.map((u) => (
            <li key={u.id} className="list-item">
              <span>{u.name} ({u.email}) — <strong>{u.role}</strong></span>
              <button className="btn-link" onClick={() => handleToggleRole(u)}>
                {u.role === 'content_manager' ? 'Demote to User' : 'Promote to Content Manager'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
