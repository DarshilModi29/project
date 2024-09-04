import React, { useCallback, useEffect, useState } from 'react';
import config from '../components/Config';
import ImageTable from '../components/ImageTable';
import Cookies from 'js-cookie';
import PaginationData from '../components/Pagination';

const headings = ["", "Image", "Uploader", "Tags", "Description", "Size", "Ratings", "Downloads", "Actions"]
const limit = 10;

const Images = () => {

    const [images, setImages] = useState([]);
    const [totalImages, setTotalImages] = useState(0);
    const [activePage, setActivePage] = useState(1);

    const getImages = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/allImages?limit=${limit}&page=${activePage}`, {
                headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setImages(data.data);
                setTotalImages(data.totalImages);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, [activePage]);

    useEffect(() => {
        getImages();
    }, [getImages])
    return (
        <ImageTable getImages={getImages} title={"Images"} subtitle={"All Images"} headings={headings} images={images} config={config}>
            <PaginationData total={totalImages} setActivePage={setActivePage} activePage={activePage} />
        </ImageTable>
    );
};

export default Images;
