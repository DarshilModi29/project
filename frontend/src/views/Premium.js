import React, { useState, useEffect, useCallback } from 'react';
import { Button, Col, Row } from 'reactstrap';
import config from '../admin/components/Config';
import Cookies from "js-cookie";

const Premium = () => {
    const [pricingModel, setPricingModel] = useState([]);
    const getPricingModels = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/show-premium-pricing`, {
                method: 'GET',
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPricingModel(data.data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, []);

    const getPremium = async (e, price, month) => {
        if (Cookies.get("isPremium")) {
            alert("You are already a premium user");
            return;
        }
        const response = await fetch(`${config.SERVER_URL}/api/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `bearer ${Cookies.get("jwt")}`
            },
            body: JSON.stringify({
                amount: price * 100,
                currency: "INR",
                receipt: `order_${Date.now()}`
            })
        });
        const order = await response.json();
        if (response.ok) {
            const key_id = process.env.REACT_APP_RAZORPAY_KEY_ID
            var options = {
                "key": key_id.replaceAll('"', ''),
                "amount": price * 100,
                "currency": "INR",
                "name": "Infinite Gallery",
                "description": "Test Transaction",
                "image": `${config.SERVER_URL}/images/other/logo.png`,
                "order_id": order.id,
                "handler": async function (response) {
                    const validateRes = await fetch(`${config.SERVER_URL}/api/subscribe/validate`, {
                        method: "POST",
                        body: JSON.stringify({
                            ...response, amount: price, duration_month: month
                        }),
                        headers: {
                            "Authorization": `bearer ${Cookies.get("jwt")}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const validateJson = await validateRes.json();
                    if (validateRes.ok) {
                        alert(validateJson.message);
                        Cookies.set("isPremium", "true");
                    } else {
                        alert(validateJson.message);
                    }
                },
                "theme": {
                    "color": "#3399cc"
                }
            };
            var rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();
            e.preventDefault();
        } else {
            alert(order.message);
        }
    }

    useEffect(() => {
        getPricingModels();
    }, [getPricingModels])

    return (
        <>
            <div className='d-flex flex-column align-items-center justify-content-center container'>
                <div className="w-80 premium-feature bg-white d-flex align-items-center justify-content-center flex-column p-lg-5 p-3 rounded-4 shadow mb-lg-0 mb-2">
                    <h2 className="text-center mb-4">Infinite<i className="bi bi-plus"></i></h2>
                    <ul className="list-unstyled" style={{ fontSize: "1.1rem", textTransform: "capitalize" }} >
                        <li>✅ Download all premium images</li>
                        <li>✅ Download images without watermark</li>
                        <li>✅ Download images of all size</li>
                        <li>✅ Join premium user exclusive contests</li>
                    </ul>
                    <Row className='w-100 mt-3'>
                        {
                            pricingModel?.map((pm, index) => {
                                return (
                                    <Col md className='mb-md-0 mb-3' key={index}>
                                        <h5 className="text-center">₹{pm.amount}/{pm.duration_month} MONTH</h5>
                                        <Button color='dark' block={true} className='shadow-none mt-3 rounded-5' onClick={(e) => getPremium(e, pm.amount, pm.duration_month)}>Get Infinite+</Button>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </div>
            </div>
        </>
    )
}

export default Premium