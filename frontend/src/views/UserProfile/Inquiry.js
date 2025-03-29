import React, { useCallback, useEffect, useState } from 'react'
import { Table } from 'reactstrap';
import config from "../../admin/components/Config";
import TextTruncateWithModal from '../../components/TextTruncateWithModal';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const headings = ["", "Inquiry for", "Description", "Purpose", "Status", "Action"];

const Inquiry = () => {

    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);

    const getInquiries = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/getInquiries`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setInquiries(data.data);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }, []);

    const deleteInquiry = async (id, action) => {
        try {
            const isConfirmed = await config.alerts.confirm("Are you sure?", "This action cannot be undone.");
            if (isConfirmed) {
                const response = await fetch(`${config.SERVER_URL}/api/replyInquiry/${id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `bearer ${Cookies.get("jwt")}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ action })
                });

                const data = await response.json();
                if (response.ok) {
                    getInquiries();
                    config.alerts.success(data.message);
                } else {
                    config.alerts.error(data.message)
                }
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }

    useEffect(() => {
        if (!Cookies.get("jwt")) {
            navigate("/login");
        } else {
            getInquiries();
        }
    }, [getInquiries, navigate])

    return (
        <>
            <h3 className="text-center">Your Inquiries</h3>
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
                                <td>{inquiry.inquireFor}</td>
                                <TextTruncateWithModal data={inquiry.description} />
                                <TextTruncateWithModal data={inquiry.purpose} />
                                <td className='text-center'>
                                    {inquiry.status === "pending"
                                        ? (<i className='bi bi-hourglass-split text-warning fs-5' title='Pending'></i>)
                                        : inquiry.status === "accepted"
                                            ? (<i className='bi bi-check-circle text-success fs-5' title='Approved'></i>)
                                            : (<i className='bi bi-x-circle text-danger fs-5' title='Rejected'></i>)}
                                </td>
                                <td className='text-center'>
                                    <i className='bi bi-trash text-danger fs-5' role='button' onClick={() => deleteInquiry(inquiry._id, "delete")}></i>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </>
    )
}

export default Inquiry