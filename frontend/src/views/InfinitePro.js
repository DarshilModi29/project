import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap'
import { infinteProSchema } from '../schema';
import { getIndiaState, getIndiaDistrict } from "india-state-district";
import config from '../admin/components/Config';
import Cookies from "js-cookie";

const initVal = {
    email: '',
    phn_number: '',
    upi: '',
    state: 'AP',
    city: 'Srikakulam'
}

const InfinitePro = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [verificationImage, setVerificationImage] = useState(null);
    const [imageError, setImageError] = useState('');
    const [isAccepted, setIsAccepted] = useState(false);
    const [termsError, setTermsError] = useState('');
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const extensionFilter = (file) => {
        if (!file) return false;

        return ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
    }

    const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
        initialValues: initVal,
        validationSchema: infinteProSchema,
        onSubmit: async (values, action) => {
            try {
                if (!isAccepted) {
                    setTermsError('Please accept the terms and conditions');
                } else if (!verificationImage) {
                    setImageError('Please upload the verification image');
                } else if (verificationImage && !extensionFilter(verificationImage)) {
                    setImageError('Only jpg, png, jpeg and pdf files allowed');
                } else {
                    const fd = new FormData();
                    fd.append('file', verificationImage);
                    fd.append('email', values.email);
                    fd.append('phn_number', values.phn_number);
                    fd.append('upi', values.upi);
                    fd.append('state', values.state);
                    fd.append('city', values.city);

                    const response = await fetch(`${config.SERVER_URL}/api/application-form`, {
                        method: "POST",
                        headers: {
                            "Authorization": `bearer ${Cookies.get("jwt")}`
                        },
                        body: fd
                    });
                    const data = await response.json();
                    if (response.ok) {
                        action.resetForm();
                        setIsAccepted(false);
                        setVerificationImage(null);
                        setFileInputKey(Date.now());
                        setTermsError('');
                        setImageError('');
                        alert(data.message);
                    } else {
                        alert(data.message);
                    }
                }
            } catch (error) {
                console.log(error);
                alert(error.toString());
            }
        }
    })

    const toggleModal = () => {
        setIsOpen(!isOpen);
    }

    useEffect(() => {
        const districts = getIndiaDistrict(values.state);
        values.city = districts[0];
    }, [values.state]);

    return (
        <>
            <div className="container mt-4">
                {/* Title */}
                <h3 className="text-center fw-bold mb-4 text-uppercase">Infinite Pro Photographer Form</h3>
                <Form onSubmit={handleSubmit} encType='multipart/form-data'>
                    <Row>
                        <Col md='6'>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input type="email" id="email" name="email" onChange={handleChange} onBlur={handleBlur} value={values.email} className='shadow-none' />
                                {
                                    errors.email && touched.email ? (
                                        <p className='text-danger'>{errors.email}</p>
                                    ) : null
                                }
                            </FormGroup>
                        </Col>
                        <Col md='6'>
                            <FormGroup>
                                <Label>Phone Number</Label>
                                <Input type='text' id="phn_number" name="phn_number" onChange={handleChange} onBlur={handleBlur} value={values.phn_number} className='shadow-none' />
                                {
                                    errors.phn_number && touched.phn_number ? (
                                        <p className='text-danger'>{errors.phn_number}</p>
                                    ) : null
                                }
                            </FormGroup>
                        </Col>
                        <Col md='6'>
                            <FormGroup>
                                <Label>UPI ID</Label>
                                <Input type='text' id="upi" name="upi" onChange={handleChange} onBlur={handleBlur} value={values.upi} className='shadow-none' />
                                {
                                    errors.upi && touched.upi ? (
                                        <p className='text-danger'>{errors.upi}</p>
                                    ) : null
                                }
                            </FormGroup>
                        </Col>
                        <Col md='6'>
                            <FormGroup>
                                <Label>Your Verification ID</Label>
                                <Input type='file' id="verification_image" key={fileInputKey} name="verification_image" onChange={(e) => {
                                    setVerificationImage(e.target.files[0]);
                                    setImageError("");
                                }} className='shadow-none' />
                                <span className="text-muted small">Eg. Aadhar card, Driving Licenece, PAN card etc.</span>
                                {imageError ? (<p className="text-danger">{imageError}</p>) : null}
                            </FormGroup>
                        </Col>
                        <Col md='6'>
                            <FormGroup>
                                <Label>State</Label>
                                <Input type='select' id="state" name="state" onChange={handleChange} onBlur={handleBlur} value={values.state} className='shadow-none'>
                                    {
                                        getIndiaState().map((state, index) => {
                                            return <option key={index} value={state.code}>{state.state}</option>
                                        })
                                    }
                                </Input>
                                {
                                    errors.state && touched.state ? (
                                        <p className='text-danger'>{errors.state}</p>
                                    ) : null
                                }
                            </FormGroup>
                        </Col>
                        <Col md='6'>
                            <FormGroup>
                                <Label>City</Label>
                                <Input type='select' id="city" name="city" onChange={handleChange} onBlur={handleBlur} value={values.city} className='shadow-none'>
                                    {
                                        getIndiaDistrict(values.state).map((city, index) => {
                                            return <option key={index} value={city}>{city}</option>
                                        })
                                    }
                                </Input>
                                {
                                    errors.city && touched.city ? (
                                        <p className='text-danger'>{errors.city}</p>
                                    ) : null
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                    <FormGroup>
                        <Input type='checkbox' onChange={(e) => {
                            setIsAccepted(e.target.checked);
                            setTermsError("");
                        }} checked={isAccepted} /> Accept our {" "}
                        <span role='button' className='text-decoration-underline text-primary'
                            onClick={toggleModal}>Terms & conditions</span>
                        {termsError ? (<p className="text-danger">{termsError}</p>) : null}
                    </FormGroup>
                    <Button type='submit' color='primary'>Submit</Button>
                </Form>
            </div>
            <Modal backdrop='static' keyboard={false} isOpen={isOpen} toggle={toggleModal} size='xl'>
                <ModalHeader>
                    <h4 className="mb-3 fw-semibold">📜 Terms & Conditions</h4>
                </ModalHeader>
                <ModalBody>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            ✅ Your application will be reviewed by our admins before approval.
                        </li>
                        <li className="list-group-item">
                            ✅ Approval depends on your portfolio, activities, and profile.
                        </li>
                        <li className="list-group-item">
                            💰 You can earn **₹100 to ₹300** per month based on photo ratings
                            and downloads (**Max 30 photos per month**).
                        </li>
                        <li className="list-group-item">
                            🖼️ Only **original high-quality** photos are accepted. No copied or
                            low-resolution images.
                        </li>
                        <li className="list-group-item">
                            🚫 If you are found involved in any **illegal activities**, your
                            account will be **permanently banned**.
                        </li>
                        <li className="list-group-item">
                            🔄 Terms & Conditions may be updated, and you will be notified of
                            major changes.
                        </li>
                        <li className="list-group-item">
                            🔒 Your personal information will be kept confidential and used only for platform-related purposes.
                        </li>
                    </ul>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default InfinitePro