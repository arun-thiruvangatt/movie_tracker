import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Movies from "./pages/Movies.jsx"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./Layout"
import RequireAuth from "./components/RequireAuth"
import CreateContent from "./pages/CreateContent.jsx"
import ContentDetail from "./pages/ContentDetail.jsx"
import Series from "./pages/Series.jsx"
import Profile from "./pages/Profile.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="movies" element={<Movies />} />
            <Route path="series" element={<Series />} />
            <Route
              path="dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="create"
              element={
                <RequireAuth>
                  <CreateContent />
                </RequireAuth>
              }
            />
            <Route
              path="content/:id"
              element={
                <RequireAuth>
                  <ContentDetail />
                </RequireAuth>
              }
            />
            <Route
              path="profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
