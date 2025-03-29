import { lazy } from "react";
import { Navigate } from "react-router-dom";
import "../App.css";

const FullLayout = lazy(() => import("../components/FullLayout"));

const Home = lazy(() => import("../views/Home"));
const About = lazy(() => import("../views/About"));
const Images = lazy(() => import("../views/Images"));
const Inquiry = lazy(() => import("../views/Inquiry"));
const Login = lazy(() => import("../views/Login"));
const Signup = lazy(() => import("../views/Signup"));
const VerifyEmail = lazy(() => import("../views/VerifyEmail"));
const UserImages = lazy(() => import("../views/UserProfile/Image"));
const UserInquiry = lazy(() => import("../views/UserProfile/Inquiry"));
const Downloads = lazy(() => import("../views/UserProfile/Downloads"));
const SavedImages = lazy(() => import("../views/UserProfile/SavedImages"));
const Profile = lazy(() => import("../components/Profile"));
const ContestDetail = lazy(() => import("../views/ContestDetails"));
const Contest = lazy(() => import("../views/Contest"));
const Premium = lazy(() => import("../views/Premium"));
const InfinitePro = lazy(() => import("../views/InfinitePro"));
const UserContest = lazy(() => import("../views/UserProfile/Contest"));
const Earnings = lazy(() => import("../views/UserProfile/Earnings"));

const UserRoutes = [
    {
        path: "/",
        element: <FullLayout />,
        children: [
            { path: "/", element: <Navigate to="/home" /> },
            { path: "/home", element: <Home /> },
            { path: "/about", element: <About /> },
            { path: "/images/:search", element: <Images /> },
            { path: "/contest", element: <Contest /> },
            { path: "/inquiry", element: <Inquiry /> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Signup /> },
            { path: "/verify", element: <VerifyEmail /> },
            { path: "/contest-details", element: <ContestDetail /> },
            { path: "/premium", element: <Premium /> },
            { path: "/infinite-pro", element: <InfinitePro /> },
            {
                path: "/profile",
                element: <Profile />,
                children: [
                    { path: "", element: <Navigate to="images" /> },
                    { path: "images", element: <UserImages /> },
                    { path: "inquiry", element: <UserInquiry /> },
                    { path: "saved-images", element: <SavedImages /> },
                    { path: "downloads", element: <Downloads /> },
                    { path: "contest", element: <UserContest /> },
                    { path: "earnings", element: <Earnings /> },
                ]
            },
            { path: "*", element: <Navigate to="/home" /> }, // Handle unknown routes
        ],
    },
];

export default UserRoutes;
