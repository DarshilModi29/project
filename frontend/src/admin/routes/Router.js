import { lazy } from "react";
import { Navigate } from "react-router-dom";

/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Pages ****/
const Starter = lazy(() => import("../views/Starter.js"));
const Users = lazy(() => import("../views/Users.js"));
const Images = lazy(() => import("../views/Images.js"));
const Inquiry = lazy(() => import("../views/Inquiry.js"));
const SubAdmin = lazy(() => import("../views/SubAdmin.js"));
const Tags = lazy(() => import("../views/Tags.js"));
const Contest = lazy(() => import("../views/Contest.js"));
const ContestDetails = lazy(() => import("../views/ContestDetails.js"));

/*****Routes******/
const AdminRoutes = [
  {
    path: "/",
    element: <FullLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" /> },
      { path: "/dashboard", element: <Starter /> },
      { path: "/users", element: <Users /> },
      { path: "/images", element: <Images /> },
      { path: "/inquiries", element: <Inquiry /> },
      { path: "/sub-admins", element: <SubAdmin /> },
      { path: "/tags", element: <Tags /> },
      { path: "/contests", element: <Contest /> },
      { path: "/contest-details", element: <ContestDetails /> },
      { path: "*", element: <Navigate to="/dashboard" /> }, // Handle unknown routes
    ],
  },
];

export default AdminRoutes;
