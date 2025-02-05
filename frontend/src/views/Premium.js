import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import config from '../admin/components/Config';
import Cookies from "js-cookie";

const Premium = () => {
    const getPremium = async (e, price) => {
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
                        ...response, amount: price
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
    }

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
                        <Col md={6} className='mb-md-0 mb-3'>
                            <h5 className="text-center">₹159/1 MONTH</h5>
                            <Button color='dark' block={true} className='shadow-none mt-3 rounded-5' onClick={(e) => getPremium(e, 159)}>Get Infinite+</Button>
                        </Col>
                        <Col md={6}>
                            <h5 className="text-center">₹399/3 MONTH</h5>
                            <Button color='dark' block={true} className='shadow-none mt-3 rounded-5' onClick={(e) => getPremium(e, 399)}>Get Infinite+</Button>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    )
}

export default Premium