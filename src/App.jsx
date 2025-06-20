import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ToastContainer } from "react-toastify";
import Layout from "@/Layout";
import userSlice, { clearUser, setUser } from "@/store/userSlice";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import PromptPassword from "@/pages/PromptPassword";
import ErrorPage from "@/pages/ErrorPage";
import Callback from "@/pages/Callback";
import ResetPassword from "@/pages/ResetPassword";


// Create auth context
export const AuthContext = createContext(null);

// Redux Store
const store = configureStore({
  reducer: {
    user: userSlice,
  },
});

function AppRouter() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
            '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
               ? `/signup?redirect=${currentPath}`
               : currentPath.includes('/login')
               ? `/login?redirect=${currentPath}`
               : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, [navigate, dispatch]);

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading">Initializing application...</div>;
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/prompt-password" element={<PromptPassword />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <AppRouter />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="z-[9999]"
          />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;