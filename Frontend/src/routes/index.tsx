import { createBrowserRouter } from "react-router";

import Login from "@/pages/auth/Login";
import CommonLayout from "@/components/layout/CommonLayout";
import Home from "@/pages/home/Home";
import Register from "@/pages/auth/Register";

export const router = createBrowserRouter([
  {
    element: <CommonLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
]);



