import React, { useState, useCallback, useEffect } from 'react';
import config from '../../admin/components/Config';
import Cookies from "js-cookie";

const Earnings = () => {
    const [earnings, setEarnings] = useState([]);

    const showEarnings = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/show-earnings`, {
                method: 'GET',
                headers: {
                    'Authorization': `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setEarnings(data.data);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, []);

    function getMonthName(monthNumber) {
        return new Date(2000, monthNumber).toLocaleString("en-US", { month: "long" });
    }

    useEffect(() => {
        showEarnings();
    }, [showEarnings]);

    return (
        <div className="container mt-4">
            <div className="row g-4">
                {
                    earnings.map((earning, index) => {
                        const month = new Date(earning.month).getMonth();
                        return (
                            <div className="col-md-4" key={index}>
                                <div className="card earning-card shadow-lg border-0 rounded-4 p-3 text-center">
                                    <div className="card-body">
                                        <h5 className="fw-bold month-name">{getMonthName(month)}</h5>
                                        <h4 className="earning-amount">₹{earning.amount}</h4>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default Earnings;