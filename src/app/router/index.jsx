import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import PublicLayout from '@/shared/layout/PublicLayout';
import AdminLayout from '@/shared/layout/AdminLayout';
import AdminProtectedRoute from '@/features/auth/AdminProtectedRoute';

import HomePage from '@/features/home/HomePage';
import AboutPage from '@/features/about/AboutPage';
import ArtworksPage from '@/features/artworks/ArtworksPage';
import ShopPage from '@/features/shop/ShopPage';
import ProductDetailPage from '@/features/products/ProductDetailPage';
import CartPage from '@/features/cart/CartPage';
import ContactPage from '@/features/contact/ContactPage';
import PoliciesPage from '@/features/policies/PoliciesPage';
import PolicyDetailPage from '@/features/policies/PolicyDetailPage';

const CheckoutPage = lazy(() => import('@/features/checkout/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/features/orders/OrderConfirmationPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/admin/DashboardPage'));
const AdminProductsPage = lazy(() => import('@/features/admin/AdminProductsPage'));
const AdminArtworksPage = lazy(() => import('@/features/admin/AdminArtworksPage'));
const AdminOrdersPage = lazy(() => import('@/features/admin/AdminOrdersPage'));
const MediaPage = lazy(() => import('@/features/media-library/MediaPage'));
const SiteSettingsPage = lazy(() => import('@/features/site-settings/SiteSettingsPage'));
const AdminContentPage = lazy(() => import('@/features/admin/AdminContentPage'));
const AdminPoliciesPage = lazy(() => import('@/features/admin/AdminPoliciesPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/AdminUsersPage'));

function LazyFallback() {
  return <div style={{ textAlign: 'center', padding: '3rem 0', color: '#737373', fontSize: '0.875rem' }}>Cargando...</div>;
}

function SuspenseWrap({ children }) {
  return <Suspense fallback={<LazyFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/sobre-mi', element: <AboutPage /> },
      { path: '/ilustraciones', element: <ArtworksPage /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/shop/:slug', element: <ProductDetailPage /> },
      { path: '/carrito', element: <CartPage /> },
      { path: '/checkout', element: <SuspenseWrap><CheckoutPage /></SuspenseWrap> },
      { path: '/pedido-recibido/:orderId', element: <SuspenseWrap><OrderConfirmationPage /></SuspenseWrap> },
      { path: '/contacto', element: <ContactPage /> },
      { path: '/politicas', element: <PoliciesPage /> },
      { path: '/politicas/:slug', element: <PolicyDetailPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <SuspenseWrap><LoginPage /></SuspenseWrap>,
  },
  {
    path: '/admin/registro',
    element: <SuspenseWrap><RegisterPage /></SuspenseWrap>,
  },
  {
    path: '/admin',
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
          { path: 'productos', element: <SuspenseWrap><AdminProductsPage /></SuspenseWrap> },
          { path: 'ilustraciones', element: <SuspenseWrap><AdminArtworksPage /></SuspenseWrap> },
          { path: 'pedidos', element: <SuspenseWrap><AdminOrdersPage /></SuspenseWrap> },
          { path: 'media', element: <SuspenseWrap><MediaPage /></SuspenseWrap> },
          { path: 'configuracion', element: <SuspenseWrap><SiteSettingsPage /></SuspenseWrap> },
          { path: 'contenido', element: <SuspenseWrap><AdminContentPage /></SuspenseWrap> },
          { path: 'politicas', element: <SuspenseWrap><AdminPoliciesPage /></SuspenseWrap> },
          { path: 'usuarios', element: <SuspenseWrap><AdminUsersPage /></SuspenseWrap> },
        ],
      },
    ],
  },
]);
