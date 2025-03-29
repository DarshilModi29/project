import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Button } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import config from '../../admin/components/Config';
import Cookies from "js-cookie";

const Contest = () => {
    const [contests, setContests] = useState([]);
    const navigate = useNavigate();

    const fetchContests = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/user-contests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('jwt')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setContests(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchContests();
    }, [fetchContests])

    return (
        <div className="row px-3">
            {
                contests?.map((con, index) => {
                    const stat_class = con.status === "Not Started" ?
                        "text-primary" : con.status === "Canceled" ?
                            "text-danger" : "text-success";
                    return (
                        <div key={index} className="col-md-6 mb-2 px-1">
                            <div className="p-3 rounded mt-2 bg-white">
                                <Row>
                                    <Col md="8">
                                        <p className="m-0 h5">{con.title} {con.forPremiumUsers ? (<i className='bi bi-gem premium-user-contest' title='Only Premium Users Contest'></i>) : ""}</p>
                                        <p className='m-0 mb-2'>{con.description}</p>
                                        <hr className='my-2' />
                                        <p className={`fw-bold ${stat_class}`} style={{ fontSize: "1.1rem" }}>{con.status}</p>
                                    </Col>
                                    <Col md="4">
                                        <p className='h6'>Contest Size: {con.joined}/{con.contest_size}</p>
                                        <p className='h6'>Prize Money: ₹{con.prize_money}</p>
                                        <hr className='my-2' />
                                        <p className='h6'>Start: {new Date(con.start_date).toLocaleDateString('en-GB')}</p>
                                        <p className='h6'>End: {new Date(con.end_date).toLocaleDateString('en-GB')}</p>
                                    </Col>
                                </Row>
                                {
                                    con.winner ?
                                        <div className="text-center h4 text-primary">Winner: {con.winner.username}</div>
                                        : ""
                                }
                                <Button color='primary' className='me-1' onClick={() => {
                                    navigate(`/contest-details?id=${con._id}`)
                                }}>More Details</Button>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Contest