import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container } from "reactstrap";

const FullLayout = () => {
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