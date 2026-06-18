import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { useAuth } from './AuthContext';

export default function AdminProtectedRoute() {
  const { user, loading } = useAuth();
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    ensureAdminDoc(user).then(() => setAdminChecked(true));
  }, [user]);

  if (loading || (user && !adminChecked)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

async function ensureAdminDoc(user) {
  try {
    const ref = doc(db, 'adminUsers', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Error ensuring admin doc:', err);
  }
}
