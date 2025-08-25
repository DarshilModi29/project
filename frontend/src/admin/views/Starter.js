import { Col, Row, Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import SalesChart from "../components/dashboard/SalesChart";
import TopCards from "../components/dashboard/TopCards";
import { useCallback, useEffect, useState } from "react";
import config from "../components/Config";
import ImageTable from "../components/ImageTable";
import PaginationData from "../components/Pagination";
import Cookies from "js-cookie";

const headings = ["", "Image", "Uploader", "Tags", "Description", "Size", "Ratings", "Downloads", "Actions"]
const limit = 10;

const Starter = () => {
  const [cardDetails, setCardDetails] = useState([]);
  const [images, setImages] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [activePage, setActivePage] = useState(1);

  const getCardDetails = useCallback(async () => {
    try {
      const response = await fetch(`${config.SERVER_URL}/api/cardDetails`, {
        headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCardDetails(data.data);
      } else {
        config.alerts.error(data.message);
      }
    } catch (error) {
      config.alerts.error(error.toString());
      console.log(error);
    }
  }, []);

  const getTodayImages = useCallback(async () => {
    try {
      const response = await fetch(`${config.SERVER_URL}/api/todayImages?limit=${limit}&activePage=${activePage}`, {
        headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTotalImages(data.totalImages);
        setImages(data.data);
      } else {
        config.alerts.error(data.message);
      }
    } catch (error) {
      config.alerts.error(error.toString());
      console.log(error);
    }
  }, [activePage]);

  useEffect(() => {
    getCardDetails();
    getTodayImages();;
  }, [getCardDetails, getTodayImages])
  return (
    <>
      {/***Top Cards***/}
      <Row>
        <Col sm="6" lg="4">
          <TopCards
            bg="bg-light-warning text-warning"
            title="Users"
            subtitle="Total Users"
            earning={cardDetails[0]}
            icon="bi bi-person"
          />
        </Col>
        <Col sm="6" lg="4">
          <TopCards
            bg="bg-light-success text-success"
            title="Images"
            subtitle="Uploaded Images"
            earning={cardDetails[1]}
            icon="bi bi-card-image"
          />
        </Col>
        <Col sm="6" lg="4">
          <TopCards
            bg="bg-light-danger text-danger"
            title="Downloads"
            subtitle="Total Downloads"
            earning={cardDetails[2]}
            icon="bi bi-download"
          />
        </Col>
      </Row>
      {/***Sales***/}
      {/* <Col sm="12" lg="12" xl="7" xxl="8"> */}
      <SalesChart />
      {/***Today Uploaded Image Table***/}
      <Row>
        <Col lg="12">
          <Card className='scrollable'>
            <CardBody>
              <CardTitle tag="h5">Images</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Images Uploaded today
              </CardSubtitle>
              <ImageTable limit={limit} activePage={activePage} getImages={getTodayImages} title={"Images"} subtitle={"Images Uploaded Today"} headings={headings} images={images} config={config}>
                <PaginationData total={totalImages} setActivePage={setActivePage} activePage={activePage} />
              </ImageTable>
            </CardBody>
          </Card>
        </Col>
      </Row >
    </>
  );
};

export default Starter;
