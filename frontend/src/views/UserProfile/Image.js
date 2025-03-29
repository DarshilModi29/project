import React, { useCallback, useEffect, useState } from 'react'
import config from '../../admin/components/Config';
import Cookies from 'js-cookie';
import ShowImages from '../../components/ShowImages';
import { useNavigate } from 'react-router-dom';

const Image = () => {

    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const fetchUserImages = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/userImage`, {
                headers: {
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setImages(data.data);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            config.alerts.error(error.toString());
            console.log(error);
        }
    }, []);

    useEffect(() => {
        if (!Cookies.get("jwt")) {
            navigate("/login");
        } else {
            fetchUserImages();
        }
    }, [fetchUserImages, navigate])

    return (
        <>
            <h3 className='text-center mb-3'>Your Images</h3>
            <ShowImages images={images} page={"user"} fetchUserImages={fetchUserImages} />
        </>
    )
}

export default Image