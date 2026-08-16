import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function About() {
  const [about, setAbout] = useState('');

  useEffect(() => {
    api.get('/contact/site-content').then(res => setAbout(res.data.about));
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <h1 className="mb-4">About Us</h1>
      <p className="text-muted fs-5">{about}</p>
    </div>
  );
}
