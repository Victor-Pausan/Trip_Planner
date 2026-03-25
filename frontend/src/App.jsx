import React from "react";
import { BrowserRouter, Navigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import GroupList from "./pages/GroupList";
import Group from "./pages/Group";
import JoinGroup from "./pages/JoinGroup";
import Trip from "./pages/Trip";
import NewTrip from "./pages/NewTrip"
import { UserProvider, useUser } from "./contexts/UserContext";

function Logout() {
  const { clearUser } = useUser();
  localStorage.clear();
  clearUser();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        <Route
          path="/group"
          element={
            <ProtectedRoute>
              <GroupList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:slug"
          element={
            <ProtectedRoute>
              <Group />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/join/:token"
          element={<JoinGroup />}
        />

        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <Trip />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-trip"
          element={
            <ProtectedRoute>
              <NewTrip />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
