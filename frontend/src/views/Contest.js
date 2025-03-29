import React, { useCallback, useEffect, useState } from 'react'
import config from '../admin/components/Config';
import { Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import Dropzone from '../components/Dropzone';
import { extensionFilter } from '../schema';

const Contest = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [participant, setParticipant] = useState([]);
    const [isUploaded, setIsUploaded] = useState([]);
    const [images, setImages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [contestId, setContestId] = useState("");
    const [error, setError] = useState("");

    const toggleModal = () => {
        setImages([]);
        setIsOpen(!isOpen);
    }

    const uploadImage = async (e) => {
        e.preventDefault();
        if (images.length === 0) {
            setError("Please select an image");
        } else if (!extensionFilter(images[0])) {
            setError("Invalid image type");
        } else if (images[0].size / (1024 * 1024) > 4) {
            setError("Image size exceeds 4MB");
        } else {
            const isConfirmed = await config.alerts.confirm("Are you sure?", "This action cannot be undone.");
            if (isConfirmed) {
                if (window.confirm("Are you sure you want to upload this image? You can't change this image after uplaoding it.")) {
                    const formData = new FormData();
                    formData.append("contest_image", images[0]);
                    const response = await fetch(`${config.SERVER_URL}/api/contest-image/${contestId}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `bearer ${Cookies.get("jwt")}`
                        },
                        body: formData,
                    });
                    const data = await response.json();
                    if (response.ok) {
                        if (data.success) {
                            config.alerts.success(data.success);
                            toggleModal();
                            setContestId("");
                            checkParticipant();
                        }
                    } else if (data.error) {
                        setError(data.error);
                    } else {
                        config.alerts.error(data.message);
                    }
                }
            }
        }
    }

    const fetchContests = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/all-contests`);
            const data = await response.json();
            if (response.ok) {
                setContests(data.data);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }, []);

    const joinContest = async (id) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/join-contest/${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                config.alerts.success(data.message);
                fetchContests();
                checkParticipant();
            } else {
                if (!data.status) {
                    config.alerts.error(data.message);
                    navigate("/premium");
                } else {
                    config.alerts.error(data.message);
                }
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }

    const checkParticipant = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/check-participant`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const contests = data.data?.map((contest) => contest.contest);
                const uploadedImage = data.data?.map((contest) => contest.image);
                setParticipant(contests);
                setIsUploaded(uploadedImage);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }, []);

    useEffect(() => {
        fetchContests();
        checkParticipant();
    }, [fetchContests, checkParticipant]);
    return (
        <>
            <div className="contest-rules my-4 p-4 border rounded bg-light">
                <h3 className="text-primary mb-3">Basic Rules</h3>
                <ul className="list-group">
                    <li className="list-group-item">Only one contest starts and ends at a time.</li>
                    <li className="list-group-item">The contest starts and ends at 12:00 AM on the specified date.</li>
                    <li className="list-group-item">The winner will be announced on the contest's end date.</li>
                    <li className="list-group-item">
                        The winner must email their details within 2 days of the announcement.
                    </li>
                </ul>
            </div>

            <div className="row">
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
                                    {
                                        con.status === "Started" ?
                                            participant.includes(con._id) ?
                                                <Button color='warning'
                                                    disabled={isUploaded.length > 0 && isUploaded[0] ? true : false}
                                                    className='shadow-none' onClick={() => {
                                                        setIsOpen(true);
                                                        setImages([]);
                                                        setContestId(con._id);
                                                    }}>Upload Image
                                                </Button> :
                                                <Button disabled={con.forPremiumUsers && !Cookies.get("isPremium")} color='success' onClick={() => joinContest(con._id)}>{con.forPremiumUsers && !Cookies.get("isPremium") ?
                                                    (
                                                        <>
                                                            <i className='bi bi-lock'></i> Join
                                                        </>
                                                    ) : "Join"}</Button>
                                            : ""
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <Modal isOpen={isOpen} toggle={toggleModal}>
                <form encType='multipart/form-data'>
                    <ModalHeader>Upload Image</ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <Dropzone id="contest_image" files={images} setFiles={setImages} multiple={false} />
                            {
                                error ? <p className='text-danger'>{error}</p> : null
                            }
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button type="submit" className="btn btn-success shadow-none" onClick={uploadImage}>Upload</button>
                        <Button color='primary' onClick={toggleModal}>Close</Button>
                    </ModalFooter>
                </form>
            </Modal>
        </>
    )
}

export default Contest