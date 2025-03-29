import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from "../admin/components/Config";
import Cookies from "js-cookie";

const ProfileBar = () => {
    const location = useLocation();
    const [routes, setRoutes] = useState([
        { path: "/profile", component: "Images" },
        { path: "/profile/inquiry", component: "Inquiry" },
        { path: "/profile/downloads", component: "Downloads" },
        { path: "/profile/saved-images", component: "Saved Images" },
        { path: "/profile/contest", component: "Contests" },
    ]);

    const isProPhotographer = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/isInfinitePro`, {
                method: "GET",
                headers: {
                    Authorization: `bearer ${Cookies.get("jwt")}`,
                },
            });
            const data = await response.json();

            if (response.ok && data.data) {
                setRoutes(prevRoutes => {
                    if (!prevRoutes.some(route => route.path === "/profile/earnings")) {
                        return [...prevRoutes, { path: "/profile/earnings", component: "Earnings" }];
                    }
                    return prevRoutes;
                });
            }
        } catch (error) {
            console.error("Error fetching photographer status:", error);
        }
    }, []);

    useEffect(() => {
        isProPhotographer();
    }, [isProPhotographer]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow">
            <div className="container-fluid">
                <button
                    className="navbar-toggler shadow-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#profilebarSupportedContent"
                    aria-controls="profilebarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="profilebarSupportedContent">
                    <ul className="navbar-nav w-100 d-flex justify-content-around mb-2 mb-lg-0">
                        {routes.map((route, index) => (
                            <li className="nav-item" key={index}>
                                <Link
                                    className={`nav-link fs-6 ${location.pathname === route.path ? 'active' : 'text-dark'}`}
                                    to={route.path}
                                >
                                    {route.component}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default ProfileBar;
