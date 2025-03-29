import React from 'react';
import { Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import config from './Config';
import Cookies from "js-cookie";

const ApplicationTable = ({ page, data, fetchApplications }) => {

    const acceptApplication = async (id) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/accept-application/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                config.alerts.success(data.message);
                fetchApplications();
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }

    const rejectApplication = async (id) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/reject-application/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                config.alerts.success(data.message);
                fetchApplications();
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }

    return (
        <>
            <Table bordered>
                <thead>
                    <tr>
                        <th></th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>UPI</th>
                        <th>Verification ID</th>
                        <th>State</th>
                        <th>City</th>
                        <th>Created At</th>
                        {
                            page === "progress" && (<th>Actions</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data.length > 0 ?
                            data?.map((dt, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{dt.user.username}</td>
                                        <td>{dt.email}</td>
                                        <td>{dt.phn_number}</td>
                                        <td>{dt.upi}</td>
                                        <td>
                                            <Link target='_blank' className='text-primary text-decoration-underline' to={`${config.SERVER_URL}/${dt.verification_id}`}>Verification ID</Link>
                                        </td>
                                        <td>{dt.state}</td>
                                        <td>{dt.city}</td>
                                        <td>{new Date(dt.createdAt).toLocaleDateString('en-GB')}</td>
                                        {
                                            page === "progress" && (
                                                <td className='d-flex'>
                                                    <i class="text-primary bi bi-list-check fs-5" role='button' onClick={() => {
                                                        acceptApplication(dt._id);
                                                    }} title='accept'></i>
                                                    <i class="text-danger bi bi-x-lg ms-2 fs-5" role='button' onClick={() => {
                                                        rejectApplication(dt._id);
                                                    }} title='reject'></i>
                                                </td>
                                            )
                                        }
                                    </tr>
                                )
                            }) : (
                                <td colSpan={12}>
                                    <h5 className="text-center">No Data Available</h5>
                                </td>
                            )
                    }
                </tbody>
            </Table>
        </>
    )
}

export default ApplicationTable