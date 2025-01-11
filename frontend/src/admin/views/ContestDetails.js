import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import config from '../components/Config';

const ContestDetails = () => {
    const [searchParam] = useSearchParams();
    const [contestData, setContestData] = useState([]);
    const id = searchParam.get("id");
    const navigate = useNavigate();

    const fetchContest = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/contest/${id}`);
            const data = await response.json();
            if (response.ok) {
                setContestData(data.data);
            }
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }, [id]);

    useEffect(() => {
        fetchContest();
    }, [fetchContest])

    return (
        <div className="container">
            <div className="back-button mb-2">
                <i role="button" className='bi bi-arrow-left fs-3' onClick={() => {
                    navigate("/contests");
                }}></i>
            </div>
            {contestData ? (
                <div className="card shadow">
                    <div className="card-header bg-primary text-white text-center">
                        <h2>{contestData.title}</h2>
                    </div>
                    <div className="card-body">
                        <p className="lead text-muted">{contestData.description}</p>
                        <hr />
                        <div className="row">
                            <div className="col-md-6">
                                <h5>Contest Details</h5>
                                <ul className="list-group">
                                    <li className="list-group-item">
                                        <strong>Start Date:</strong>{" "}
                                        {new Date(contestData.start_date).toLocaleDateString()}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>End Date:</strong>{" "}
                                        {new Date(contestData.end_date).toLocaleDateString()}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Joined:</strong> {contestData.joined}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Contest Size:</strong> {contestData.contest_size}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Prize Money:</strong> ₹{contestData.prize_money}
                                    </li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h5>Rules</h5>
                                <div
                                    className="border rounded p-3"
                                    dangerouslySetInnerHTML={{ __html: contestData.rules }}
                                ></div>
                            </div>
                        </div>
                        <hr />
                        <div className="text-center">
                            {contestData.status === "Not Started" ? (
                                <h5 className="text-primary">
                                    {contestData.status}
                                </h5>
                            ) : contestData.status === "Canceled" ? (
                                <h5 className="text-danger">{contestData.status}</h5>
                            ) : (
                                <h5 className="text-success">{contestData.status}</h5>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p>Loading contest details...</p>
                </div>
            )}
        </div>
    );
}

export default ContestDetails