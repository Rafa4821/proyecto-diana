import { createBrowserRouter } from 'react-router-dom';

import PublicLayout from '@/shared/layout/PublicLayout';
import AdminLayout from '@/shared/layout/AdminLayout';

import HomePage from '@/features/home/HomePage';
import AboutPage from '@/features/about/AboutPage';
import ArtworksPage from '@/features/artworks/ArtworksPage';
import ShopPage from '@/features/shop/ShopPage';
import ProductDetailPage from '@/features/products/ProductDetailPage';
import CartPage from '@/features/cart/CartPage';
import CheckoutPage from '@/features/checkout/CheckoutPage';
import OrderConfirmationPage from '@/features/orders/OrderConfirmationPage';
import ContactPage from '@/features/contact/ContactPage';
import PoliciesPage from '@/features/policies/PoliciesPage';

import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/admin/DashboardPage';
import AdminProductsPage from '@/features/admin/AdminProductsPage';
import AdminArtworksPage from '@/features/admin/AdminArtworksPage';
import AdminOrdersPage from '@/features/admin/AdminOrdersPage';
import MediaPage from '@/features/media-library/MediaPage';
import SiteSettingsPage from '@/features/site-settings/SiteSettingsPage';
import AdminContentPage from '@/features/admin/AdminContentPage';
import AdminPoliciesPage from '@/features/admin/AdminPoliciesPage';

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
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/pedido-recibido/:orderId', element: <OrderConfirmationPage /> },
      { path: '/contacto', element: <ContactPage /> },
      { path: '/politicas', element: <PoliciesPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'productos', element: <AdminProductsPage /> },
      { path: 'ilustraciones', element: <AdminArtworksPage /> },
      { path: 'pedidos', element: <AdminOrdersPage /> },
      { path: 'media', element: <MediaPage /> },
      { path: 'configuracion', element: <SiteSettingsPage /> },
      { path: 'contenido', element: <AdminContentPage /> },
      { path: 'politicas', element: <AdminPoliciesPage /> },
    ],
  },
]);
