import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Tasks from '../pages/Tasks.jsx';
import Schedule from '../pages/Schedule.jsx';
import Assets from '../pages/Assets.jsx';
import Employees from '../pages/Employees.jsx';

const routes = (
  <>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route element={<ProtectedRoute />}> 
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/employees" element={<Employees />} />
    </Route>
  </>
);

export default routes;


