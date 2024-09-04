import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../admin/components/Config';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying your email...');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyUserEmail = async () => {
            if (token) {
                try {
                    const response = await fetch(`${config.SERVER_URL}/verify/${token}`, {
                        method: 'GET',
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setMessage('Email verified successfully! Redirecting to login...');
                        setTimeout(() => {
                            navigate('/login');
                        }, 2000); // Redirect after 2 seconds
                    } else {
                        setMessage(data.message || 'Email verification failed.');
                    }
                } catch (error) {
                    console.error('Error during email verification:', error);
                    setMessage('An error occurred during email verification. Please try again.');
                }
            } else {
                setMessage('Invalid verification link.');
            }
        };

        verifyUserEmail();
    }, [token, navigate]);

    return (
        <div>
            <h2>{message}</h2>
        </div>
    );
};

export default VerifyEmail;
