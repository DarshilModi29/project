import React, { useEffect, useState } from 'react';
import ProfileBar from './ProfileBar';
import { Outlet } from 'react-router-dom';
import config from '../admin/components/Config';
import Cookies from 'js-cookie';

const Profile = () => {
    const [profileData, setProfileData] = useState([]);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await fetch(`${config.SERVER_URL}/api/userDetails`, {
                    headers: {
                        'Authorization': `bearer ${Cookies.get("jwt")}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setProfileData(data.data);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert(error.toString());
                console.log(error);
            }
        }

        getProfile();
    }, [])
    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-12 text-center">
                    <img
                        width={200}
                        height={200}
                        alt="Profile"
                        src={`${config.SERVER_URL}/${profileData.profilePic}`}
                        className="rounded-circle shadow-sm mb-3"
                    />
                </div>
                <div className="col-12 text-center">
                    <h4 className="fw-bold mb-1">{profileData.username}</h4>
                    <p className="text-muted mb-3">{profileData.email}</p>
                </div>
                <div className="col-12 mb-3">
                    <ProfileBar />
                </div>
                <div className="col-12">
                    <div className="p-3 bg-light border rounded shadow-sm">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
