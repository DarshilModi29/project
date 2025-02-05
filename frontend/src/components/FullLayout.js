import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container } from "reactstrap";
import { useEffect } from "react";
import config from "../admin/components/Config";
import Cookies from "js-cookie";

const FullLayout = () => {
    const location = useLocation();
    useEffect(() => {
        const jwt = Cookies.get("jwt");
        const isPremium = Cookies.get("isPremium");
        let callCount = parseInt(sessionStorage.getItem("callCount")) || 0;
        if (!jwt || isPremium || callCount >= 4) {
            return;
        }
        const fetchUserStatus = async () => {
            try {
                const response = await fetch(`${config.SERVER_URL}/api/checkPremium`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `bearer ${Cookies.get("jwt")}`
                        }
                    });
                const data = await response.json();
                if (response.ok && data.status) {
                    Cookies.set("isPremium", "true");
                    sessionStorage.setItem("callCount", (callCount + 1).toString());
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchUserStatus();
    }, [location.pathname]);

    return (
        <main>
            <div className="pageWrapper">
                {/********Content Area**********/}
                <div className="contentArea">
                    {/********header**********/}
                    <Navbar />
                    {/********Middle Content**********/}
                    <Container className="p-4 wrapper" fluid>
                        <Outlet />
                    </Container>

                    <Footer />
                </div>
            </div>
        </main>
    );
};

export default FullLayout;