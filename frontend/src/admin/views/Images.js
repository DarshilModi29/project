import React, { useCallback, useEffect, useState } from 'react';
import config from '../components/Config';
import ImageTable from '../components/ImageTable';
import Cookies from 'js-cookie';
import PaginationData from '../components/Pagination';
import { Nav, NavItem, NavLink, TabContent, TabPane, Row, Col, Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap';

const headings = ["", "Image", "Uploader", "Tags", "Description", "Size", "Ratings", "Downloads", "Actions"]
const limit = 10;

const Images = () => {

    const [images, setImages] = useState([]);
    const [totalImages, setTotalImages] = useState(0);
    const [activePage, setActivePage] = useState(1);
    const [activeTab, setActiveTab] = useState("1");
    const [loader, setLoader] = useState(false);

    const getImages = useCallback(async () => {
        try {
            setLoader(true);
            const response =
                activeTab === "1" ? await fetch(`${config.SERVER_URL}/api/premiumImages?limit=${limit}&page=${activePage}`, {
                    headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
                }) :
                    await fetch(`${config.SERVER_URL}/api/allImages?limit=${limit}&activePage=${activePage}`, {
                        headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
                    })
            const data = await response.json();
            if (response.ok) {
                setImages(data.data);
                setTotalImages(data.totalImages);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        } finally {
            setLoader(false);
        }
    }, [activePage, activeTab]);

    useEffect(() => {
        getImages();
    }, [getImages])
    return (
        <Row>
            <Col lg="12">
                <Card className='scrollable'>
                    <CardBody>
                        <CardTitle tag="h5">Images</CardTitle>
                        <CardSubtitle className="mb-2 text-muted" tag="h6">
                            Premium and Normal Images
                        </CardSubtitle>
                        <Nav justified pills>
                            <NavItem>
                                <NavLink active={activeTab === "1"} onClick={() => {
                                    setActiveTab("1");
                                    setImages([]);
                                    setActivePage(1);
                                }}>Premium Images</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink active={activeTab === "2"} onClick={() => {
                                    setActiveTab("2");
                                    setImages([]);
                                    setActivePage(1);
                                }}>Normal Images</NavLink>
                            </NavItem>
                        </Nav>
                        <div className="mt-4">
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId={"1"}>
                                    <ImageTable loader={loader} limit={limit} activePage={activePage} getImages={getImages} title={"Images"} subtitle={"All Images"} headings={headings} images={images} config={config}>
                                        <PaginationData total={totalImages} setActivePage={setActivePage} activePage={activePage} />
                                    </ImageTable>
                                </TabPane>
                                <TabPane tabId={"2"}>
                                    <ImageTable loader={loader} limit={limit} activePage={activePage} getImages={getImages} title={"Images"} subtitle={"All Images"} headings={headings} images={images} config={config}>
                                        <PaginationData total={totalImages} setActivePage={setActivePage} activePage={activePage} />
                                    </ImageTable>
                                </TabPane>
                            </TabContent>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row >
    );
};

export default Images;
