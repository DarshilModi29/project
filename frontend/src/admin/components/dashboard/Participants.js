import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import config from '../Config';
import { Link } from 'react-router-dom';

const Participants = ({ contestId }) => {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`${config.SERVER_URL}/api/participants/${contestId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `bearer ${Cookies.get("jwt")}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setParticipants(data.data);
                } else {
                    config.alerts.error(data.data);
                }
            } catch (error) {
                console.log(error);
                config.alerts.error(error.toString());
            }
        }

        fetchParticipants();
    }, [contestId]);

    return (
        <>
            <div className="text-center bg-primary py-1">
                <h2 className='text-white'>Participants</h2>
            </div>
            <div className="card">
                <div className="card-body">
                    <table className='table table-bordered table-striped table-hover'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Votes</th>
                                <th>Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                participants?.map((parti, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{parti.user.username}</td>
                                            <td>{parti.votes}</td>
                                            <td>
                                                {
                                                    parti.image ? (
                                                        <Link target='_blank' to={`${config.SERVER_URL}/${parti.image}`}>
                                                            <img height={"50px"} width={"50px"} src={`${config.SERVER_URL}/${parti.image}`} alt="Participant's contri" />
                                                        </Link>
                                                    ) : (
                                                        <p>Image is not uploaded</p>
                                                    )
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div >
        </>
    )
}

export default Participants