import React, { useCallback, useEffect, useState } from 'react'
import { Table } from 'reactstrap';
import config from "../../admin/components/Config";
import TextTruncateWithModal from '../../components/TextTruncateWithModal';
import Cookies from 'js-cookie';

const headings = ["", "Inquiry for", "Description", "Purpose", "Status", "Action"];

const Inquiry = () => {

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
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, []);

    const deleteInquiry = async (id, action) => {
        try {
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
                alert(data.message);
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }

    useEffect(() => {
        getInquiries();
    }, [getInquiries])

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