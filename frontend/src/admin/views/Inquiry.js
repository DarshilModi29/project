import React, { useCallback, useEffect, useState } from 'react';
import config from '../components/Config';
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Table, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Button, } from 'reactstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TextTruncateWithModal from "../components/dashboard/TextTruncateWithModal";
import Cookies from 'js-cookie';
import PaginationData from '../components/Pagination';

const headings = ["", "User", "Inquiry for", "Description", "Purpose", "Status", "Actions"];
const limit = 10;

const Inquiry = () => {

    const [inquiries, setInquiries] = useState([]);
    const [inquiry, setInquiry] = useState({ subject: "", text: "" });
    const [inquiryId, setInquiryId] = useState("");
    const [modal, setModal] = useState(false);
    const [totalInquiries, setTotalInquiries] = useState(0);
    const [activePage, setActivePage] = useState(1);

    const toggleModal = (id) => {
        setInquiryId(id);
        setModal(!modal);
    }

    const handleClose = () => {
        setModal(false);
    }

    const replyInquiry = async (id, action) => {
        const response = await fetch(`${config.SERVER_URL}/api/replyInquiry/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `bearer ${Cookies.get("jwt")}`
            },
            body: JSON.stringify(action === "reject" || action === "delete" ? { action } : (inquiry.subject === "" && inquiry.text === "") ? { action: "TagInquiry" } : inquiry)
        });
        const data = await response.json();

        if (response.ok) {
            getInquiries();
            setInquiryId("");
            handleClose();
            setInquiry({ subject: "", text: "" });
            config.alerts.success(data.message);
        } else {
            config.alerts.error(data.message);
        }
    }

    const getInquiries = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/getInquiries?page=${activePage}&limit=${limit}`, {
                headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setInquiries(data.data);
                setTotalInquiries(data.totalInquries);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            config.alerts.error(error.toString());
            console.log(error)
        }
    }, [activePage]);

    useEffect(() => {
        getInquiries();
    }, [getInquiries])
    return (
        <>
            <Row>
                <Col lg="12">
                    <Card className='scrollable'>
                        <CardBody>
                            <CardTitle tag="h5">Users</CardTitle>
                            <CardSubtitle className="mb-2 text-muted" tag="h6">
                                Registered Users
                            </CardSubtitle>

                            <Table className="no-wrap mt-3 align-middle" responsive bordered>
                                <thead>
                                    <tr>
                                        {
                                            headings?.map((data, ind) => {
                                                return (
                                                    <th className="text-center" key={ind}>{data}</th>
                                                )
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiries?.map((inquiry, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{inquiry.user_id.username}</td>
                                                <td>{inquiry.inquireFor}</td>
                                                <TextTruncateWithModal data={inquiry.description} />
                                                {
                                                    !inquiry.purpose ? (<td>-</td>) : (
                                                        <TextTruncateWithModal data={inquiry.purpose} />
                                                    )
                                                }
                                                <td className='text-center'>
                                                    {inquiry.status === "pending"
                                                        ? (<i className='bi bi-hourglass-split text-warning fs-5' title='Pending'></i>)
                                                        : inquiry.status === "accepted"
                                                            ? (<i className='bi bi-check-circle text-success fs-5' title='Approved'></i>)
                                                            : (<i className='bi bi-x-circle text-danger fs-5' title='Rejected'></i>)}
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-around">
                                                        {
                                                            inquiry.status === "pending" ? (
                                                                <>
                                                                    {inquiry.inquireFor === "Image" ? (
                                                                        <i className="bi bi-card-checklist text-primary fs-5" role="button" onClick={() => toggleModal(inquiry._id)}></i>
                                                                    ) : (
                                                                        <i className="bi bi-list-check text-primary fs-5" role="button" onClick={() => replyInquiry(inquiry._id, "approve")}></i>
                                                                    )
                                                                    }
                                                                    <i className="bi bi-ban text-danger fs-5" role="button" onClick={() => replyInquiry(inquiry._id, "reject")}></i>
                                                                </>
                                                            ) : (
                                                                <i className='bi bi-trash text-danger fs-5' role='button' onClick={() => replyInquiry(inquiry._id, "delete")}></i>
                                                            )
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                            <PaginationData total={totalInquiries} setActivePage={setActivePage} activePage={activePage} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader>Reply Inquiry Using Email</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="subject">Subject</Label>
                        <Input type='text' id='subject' value={inquiry.subject} onChange={(e) => setInquiry({ ...inquiry, subject: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="text">Text</Label>
                        <ReactQuill
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ['bold', 'italic', 'underline'],
                                    ['link']
                                ]
                            }}
                            onChange={(e) => setInquiry({ ...inquiry, text: e })} value={inquiry.text} id='text' theme="snow" />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color='success' onClick={() => replyInquiry(inquiryId, "approve")}>Send</Button>
                    <Button color='primary' onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default Inquiry;
