import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductTable from './pages/Products';
import AdminOrdersPage from './pages/Orders';
import CategoryManagement from './pages/Categories';
import EventsPage from './pages/Events';
import ProductForm from './pages/ProductForm';
import Coupons from './pages/Coupons';
import AdminLogin from './pages/Login';
import QueriesPage from './pages/Queries';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const location = useLocation();

  if (!token || (user && user.role !== 'admin')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ProductTable />} />
                  <Route path="edit-product/:id" element={<ProductForm />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="add-product" element={<ProductForm />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="queries" element={<QueriesPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;