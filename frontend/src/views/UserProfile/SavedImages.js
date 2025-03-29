import React, { useCallback, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import config from '../../admin/components/Config'
import ShowImages from '../../components/ShowImages';
import { useNavigate } from 'react-router-dom';

const SavedImages = () => {

    const navigate = useNavigate();
    const [saved, setSaved] = useState([]);

    const getSavedImages = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/get_saved`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('jwt')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSaved(data.data);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error.toString());
            config.alerts.error(error);
        }
    }, []);

    useEffect(() => {
        if (!Cookies.get("jwt")) {
            navigate("/login");
        } else {
            getSavedImages();
        }
    }, [getSavedImages, navigate])

    return (
        <>
            <h3 className='text-center mb-3'>Your Saved Images</h3>
            <ShowImages images={saved} getSavedImages={getSavedImages} page='savedImages' />
        </>
    )
}

export default SavedImages