import React, { useState } from 'react';
import config from '../admin/components/Config';
import { useNavigate } from 'react-router-dom';

// Inline CSS styles
const styles = {
    container: {
        fontFamily: '"Poppins", sans-serif',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formContent: {
        borderRadius: '10px',
        background: '#fff',
        padding: '30px',
        width: '90%',
        maxWidth: '450px',
        boxShadow: '0 30px 60px 0 rgba(0,0,0,0.3)',
        textAlign: 'center',
    },
    header: {
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '600',
        textTransform: 'uppercase',
        display: 'inline-block',
        margin: '40px 8px 10px 8px',
    },
    active: {
        color: '#0d0d0d',
        borderBottom: '2px solid #5fbae9',
    },
    input: {
        backgroundColor: '#f6f6f6',
        border: '2px solid #f6f6f6',
        color: '#0d0d0d',
        padding: '15px 32px',
        textAlign: 'center',
        fontSize: '16px',
        margin: '5px',
        width: '85%',
        borderRadius: '5px',
        transition: 'all 0.5s ease-in-out',
    },
    inputFocus: {
        backgroundColor: '#fff',
        borderBottom: '2px solid #5fbae9',
    },
    button: {
        backgroundColor: '#56baed',
        border: 'none',
        color: 'white',
        padding: '15px 80px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        textTransform: 'uppercase',
        fontSize: '13px',
        borderRadius: '5px',
        margin: '10px 20px',
        transition: 'all 0.3s ease-in-out',
    },
    buttonHover: {
        backgroundColor: '#39ace7',
    },
    buttonActive: {
        transform: 'scale(0.95)',
    },
    formFooter: {
        backgroundColor: '#f6f6f6',
        borderTop: '1px solid #dce8f1',
        padding: '25px',
        textAlign: 'center',
        borderRadius: '0 0 10px 10px',
    },
    underlineHover: {
        display: 'block',
        left: '0',
        bottom: '-10px',
        width: '0',
        height: '2px',
        backgroundColor: '#56baed',
        content: '""',
        transition: 'width 0.2s',
    },
    underlineHoverHover: {
        width: '100%',
    },
    fadeIn: {
        animation: 'fadeIn ease-in 1s',
        opacity: 0,
        animationFillMode: 'forwards',
    },
    fadeInDelay: (delay) => ({
        animationDelay: `${delay}s`,
    }),
    icon: {
        width: '60%',
    },
};

const fadeInKeyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

const underlineHoverKeyframes = `
    @keyframes underlineHover {
      from { width: 0; }
      to { width: 100%; }
    }
  `;

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const sendOtp = async (e) => {
        e.preventDefault();
        if (email.trim() === "" || !email.trim().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/)) {
            setError("Invalid Email");
            return;
        }
        const response = await fetch(`${config.SERVER_URL}/api/send-otp`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ email: email.trim() })
        });
        const data = await response.json();
        if (response.ok) {
            config.alerts.success(data.message);
            setError('');
            setStep(2);
        } else {
            config.alerts.error(data.message);
        }
    }

    const verifyOtp = async (e) => {
        e.preventDefault();
        if (otp.trim() === '') {
            setError("Please enter OTP");
            return;
        } else if (!/^\d{6}$/.test(otp.trim())) {
            setError("Invalid OTP format");
            return;
        }
        const response = await fetch(`${config.SERVER_URL}/api/verify-otp`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ otp: otp.trim() })
        });
        const data = await response.json();
        if (response.ok) {
            setError('');
            config.alerts.success(data.message);
            setStep(3);
        } else {
            config.alerts.error(data.message);
        }
    }

    const changePassword = async (e) => {
        e.preventDefault();
        if (newPassword.trim() === '') {
            setError("Please enter password");
            return;
        } else if (newPassword.trim().length < 8) {
            setError("Password must be at least 8 characters");
            return;
        } else if (confirmPassword.trim() === '') {
            setError("Please enter confirm password");
            return;
        } else if (newPassword.trim() !== confirmPassword.trim()) {
            setError("Password should be matched");
            return;
        }
        const response = await fetch(`${config.SERVER_URL}/api/change-password`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ email: email.trim(), newPassword: newPassword.trim() })
        });
        const data = await response.json();
        if (response.ok) {
            config.alerts.success(data.message);
            setStep(1);
            setNewPassword('');
            setConfirmPassword('');
            setEmail('');
            setOtp('');
            setError('');
            navigate('/login');
        } else {
            config.alerts.error(data.message);
        }
    }

    return (
        <div style={styles.container}>
            <style>
                {`
              ${fadeInKeyframes}
              ${underlineHoverKeyframes}
            `}
            </style>
            <div style={styles.formContent}>
                <h2 style={{ ...styles.header, ...styles.active }}>Frogot Password</h2>
                <div style={{ width: '60%', margin: '0 auto' }}>

                </div>
                {step === 1 && (
                    <form className='mt-2' onSubmit={sendOtp}>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Enter Email"
                            name='email'
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        {error ? <p className='text-danger text-center'>{error}</p> : ''}
                        <input
                            type="submit"
                            style={styles.button}
                            value="Get Otp"
                        />
                    </form>
                )}
                {step === 2 && (
                    <form className='mt-2' onSubmit={verifyOtp}>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Enter Otp"
                            name='otp'
                            onChange={(e) => setOtp(e.target.value)}
                            value={otp}
                        />
                        {error ? <p className='text-danger text-center'>{error}</p> : ''}
                        <input
                            type="submit"
                            style={styles.button}
                            value="Verify Otp"
                        />
                    </form>
                )}

                {step === 3 && (
                    <form className='mt-2' onSubmit={changePassword}>
                        <input
                            type="password"
                            style={styles.input}
                            placeholder="Enter Password"
                            name='otp'
                            onChange={(e) => setNewPassword(e.target.value)}
                            value={newPassword}
                        />
                        <input
                            type="password"
                            style={styles.input}
                            placeholder="Re-enter Password"
                            name='otp'
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                        />
                        {error ? <p className='text-danger text-center'>{error}</p> : ''}
                        <input
                            type="submit"
                            style={styles.button}
                            value="Change Password"
                        />
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword