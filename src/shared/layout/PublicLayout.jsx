import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './PublicLayout.css';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
