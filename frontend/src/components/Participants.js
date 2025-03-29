import React, { useCallback, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import config from '../admin/components/Config';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

const Participants = ({ contestId, isEnded }) => {
    const [participants, setParticipants] = useState([]);
    const [isVoted, setIsVoted] = useState(false);

    const voteImage = async (id) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/vote/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                },
                body: JSON.stringify({
                    contestId: contestId
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchParticipants();
                checkVote();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }

    const checkVote = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/isVoted/${contestId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setIsVoted(data.isVoted);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, [contestId])

    const fetchParticipants = useCallback(async () => {
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
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, [contestId]);

    useEffect(() => {
        checkVote();
        fetchParticipants();
    }, [fetchParticipants, checkVote]);

    return (
        <>
            <div className="text-center bg-black-50 py-1">
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
                                <th>Vote Button</th>
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
                                            <td>
                                                {
                                                    isEnded ? "Contest has been ended" : (
                                                        <Button color="primary" disabled={isVoted} onClick={() => voteImage(parti._id)}>Vote</Button>
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