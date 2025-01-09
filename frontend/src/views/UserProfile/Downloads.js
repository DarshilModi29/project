import React, { useCallback, useEffect, useState } from 'react'
import config from '../../admin/components/Config';
import Cookies from 'js-cookie';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

const Downloads = () => {

    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const fetchUserImages = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/userDownload`, {
                headers: {
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setImages(data.data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert(error.toString());
            console.log(error);
        }
    }, []);

    const downloadImage = async (e, file, quality) => {
        try {
            e.stopPropagation();
            var image = file.split("/").at(-1);
            const response = await fetch(`${config.SERVER_URL}/api/downloadImage?filename=${image}&quality=${quality}`, {
                method: "POST",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                saveAs(blob, image);
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }

    useEffect(() => {
        if (!Cookies.get("jwt")) {
            navigate("/login");
        } else {
            fetchUserImages();
        }
    }, [fetchUserImages, navigate])

    return (
        <>
            <h3 className='text-center mb-3'>Your Downloads</h3>
            <div className='border border-1 rounded-2 p-3'>
                {
                    images.map((image, index) => (
                        <>
                            <div key={index} className="download-container p-2 d-flex align-items-center w-100">
                                <img src={`${config.SERVER_URL}/${image.image.url}`} className='object-fit-contain rounded-1' width={60} height={60} alt="" />
                                <p className="ms-3 text-gray mb-0" style={{ fontSize: "1.12rem" }}>{image.user.username}</p>
                                <button className="ms-auto btn btn-outline-dark" onClick={(e) => downloadImage(e, image.image.url, image.resolution)}><i className="bi bi-arrow-down"></i></button>
                            </div>
                            <hr />
                        </>
                    ))
                }
            </div>
        </>
    )
}

export default Downloads