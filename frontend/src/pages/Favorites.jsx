import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Favorites() {
  const [locations, setLocations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [locData, actData] = await Promise.all([
        api.get('/favorites/locations'),
        api.get('/favorites/activities'),
      ]);
      setLocations(locData.locations);
      setActivities(actData.favorites);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function removeLocation(id) {
    await api.del(`/favorites/locations/${id}`);
    load();
  }

  async function removeActivity(activityId) {
    await api.del(`/favorites/activities/${activityId}`);
    load();
  }

  return (
    <div className="page">
      <h1>Your Favorites</h1>
      {error && <p className="error">{error}</p>}

      <h2>Saved Locations</h2>
      {locations.length === 0 ? <p>No saved locations yet.</p> : (
        <ul className="list">
          {locations.map((loc) => (
            <li key={loc.id} className="list-item">
              <span>{loc.city_name}{loc.country ? `, ${loc.country}` : ''}</span>
              <button className="btn-link" onClick={() => removeLocation(loc.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <h2>Favorite Activities</h2>
      {activities.length === 0 ? <p>No favorite activities yet.</p> : (
        <div className="activity-grid">
          {activities.map((act) => (
            <div key={act.favorite_id} className="card activity-card">
              <h3>{act.name}</h3>
              <p>{act.description}</p>
              <button className="btn-link" onClick={() => removeActivity(act.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
