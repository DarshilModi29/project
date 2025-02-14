import React, { useEffect, useState, useCallback } from 'react'
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Nav, NavItem, NavLink, TabPane, TabContent } from 'reactstrap'
import config from '../components/Config';
import Cookies from 'js-cookie';
import ApplicationTable from '../components/ApplicationTable';

const InfinitePro = () => {
    const [activeNav, setActiveNav] = useState("1");
    const [applications, setApplications] = useState([]);

    const fetchApplications = useCallback(async () => {
        var response;
        if (activeNav === "1") {
            response = await fetch(`${config.SERVER_URL}/api/applications`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
        } else if (activeNav === "2") {
            response = await fetch(`${config.SERVER_URL}/api/accepted-applications`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
        } else {
            response = await fetch(`${config.SERVER_URL}/api/rejected-applications`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
        }
        const data = await response.json();
        if (response.ok) {
            setApplications(data.data);
        } else {
            alert(data.message);
        }
    }, [activeNav]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return (
        <>
            <Row className='mt-3'>
                <Col lg="12">
                    <Card className='scrollable mb-0'>
                        <CardBody>
                            <div className="d-flex justify-content-between w-100">
                                <div>
                                    <CardTitle tag="h5">Applications</CardTitle>
                                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                                        Applications & Infinite Pro Photographers
                                    </CardSubtitle>
                                </div>
                            </div>
                            <Nav justified pills>
                                <NavItem>
                                    <NavLink active={activeNav === "1"} onClick={() => {
                                        setActiveNav("1");
                                        setApplications([]);
                                    }}>
                                        Applications
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink active={activeNav === "2"} onClick={() => {
                                        setActiveNav("2");
                                        setApplications([]);
                                    }}>
                                        Accepted Applications
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink active={activeNav === "3"} onClick={() => {
                                        setActiveNav("3");
                                        setApplications([]);
                                    }}>
                                        Rejected Applications
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <div className="mt-4">
                                <TabContent activeTab={activeNav}>
                                    <TabPane tabId={"1"}>
                                        <ApplicationTable data={applications} page={"progress"} fetchApplications={fetchApplications} />
                                    </TabPane>
                                    <TabPane tabId={"2"}>
                                        <ApplicationTable data={applications} page={"accepted"} />
                                    </TabPane>
                                    <TabPane tabId={"3"}>
                                        <ApplicationTable data={applications} page={"rejected"} />
                                    </TabPane>
                                </TabContent>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default InfinitePro