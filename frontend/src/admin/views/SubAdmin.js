import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Button, Card, CardBody, CardTitle, CardSubtitle, Table, Modal, ModalBody, ModalFooter, Input, ModalHeader, Label, FormGroup, Form } from "reactstrap";
import config from '../components/Config';
import { useFormik } from 'formik';
import { subAdminSchema } from '../../schema';
import PaginationData from '../components/Pagination';
import Cookies from 'js-cookie';

const headings = ["", "Profile Pic", "Username", "Email", "Status", "Actions"]
const limit = 10;

const initVal = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null
}
const SubAdmin = () => {

    const [subAdmin, setSubAdmin] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [totalSubAdmins, setTotalSubAdmin] = useState(0);
    const [activePage, setActivePage] = useState(1);

    const toggleModal = () => {
        setValues(initVal)
        setIsOpen(!isOpen);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: initVal,
        validationSchema: subAdminSchema,
        onSubmit: async (values, action) => {
            const formData = new FormData();
            formData.append("username", values.username);
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("profilePic", values.profilePic);

            const response = await fetch(`${config.SERVER_URL}/api/add-sub-admin`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                action.resetForm();
                getSubAdmins();
                handleClose();
                alert(data.message);
            } else {
                alert(data.message);
            }
        }
    });

    const removeSubAdmin = async (id) => {
        const response = await fetch(`${config.SERVER_URL}/api/remove-sub-admin/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `bearer ${Cookies.get("jwt")}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            getSubAdmins();
            alert(data.message);
        } else {
            alert(data.message);
        }
    }

    const getSubAdmins = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/sub-admins?page=${activePage}&limit=${limit}`, {
                headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSubAdmin(data.data);
                setTotalSubAdmin(data.totalSubAdmins);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert(error.toString());
            console.log(error);
        }
    }, [activePage]);

    useEffect(() => {
        getSubAdmins();
    }, [getSubAdmins])

    return (
        <>
            <Row className='mt-3'>
                <Col lg="12">
                    <Card className='scrollable mb-0'>
                        <CardBody>
                            <div className="d-flex justify-content-between w-100">
                                <div>
                                    <CardTitle tag="h5">Sub Admins</CardTitle>
                                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                                        Sub Admins
                                    </CardSubtitle>
                                </div>
                                <Button color='primary' className='h-50' onClick={toggleModal}><i className='bi bi-plus-lg'></i> Add</Button>
                            </div>

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
                                    {subAdmin?.map((sub, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className="text-center">
                                                    <img role="button" src={`${config.SERVER_URL}/${sub.profilePic}`} alt={""}
                                                        height={50} width={50} onClick={() => window.open(`${config.SERVER_URL}/${sub.profilePic}`, '_blank')} />
                                                </td>
                                                <td>{sub.username}</td>
                                                <td>{sub.email}</td>
                                                <td>{sub.isActive ? (
                                                    <span className="p-2 bg-success rounded-circle d-inline-block ms-3"></span>
                                                ) : (
                                                    <span className="p-2 bg-danger rounded-circle d-inline-block ms-3"></span>
                                                )}</td>
                                                <td>
                                                    <div className="d-flex justify-content-around">
                                                        <i className='bi bi-x-lg text-danger' role="button" onClick={() => removeSubAdmin(sub._id)}></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                            <PaginationData setActivePage={setActivePage} activePage={activePage} total={totalSubAdmins} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Modal isOpen={isOpen} toggle={toggleModal}>
                <ModalHeader>
                    Add Sub Admin
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="profilePic">Profile Pic</Label>
                            <Input name='profilePic' id='profilePic' type='file' onBlur={handleBlur}
                                onChange={(e) => {
                                    setFieldValue('profilePic', e.currentTarget.files[0]);
                                }} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="username">Username</Label>
                            <Input name="username" id="username" type='text' onChange={handleChange} onBlur={handleBlur} value={values.username} />
                            {
                                errors.username && touched.username ? (
                                    <p className='text-danger'>{errors.username}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input name="email" id="email" type='email' onChange={handleChange} onBlur={handleBlur} value={values.email} />
                            {
                                errors.email && touched.email ? (
                                    <p className='text-danger'>{errors.email}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="password">Password</Label>
                            <Input name="password" id="password" type='password' onChange={handleChange} onBlur={handleBlur} value={values.password} />
                            {
                                errors.password && touched.password ? (
                                    <p className='text-danger'>{errors.password}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="confirmPassword">Confirm Password</Label>
                            <Input name="confirmPassword" id="confirmPassword" type='password' onChange={handleChange} onBlur={handleBlur} value={values.confirmPassword} />
                            {
                                errors.confirmPassword && touched.confirmPassword ? (
                                    <p className='text-danger'>{errors.confirmPassword}</p>
                                ) : null
                            }
                        </FormGroup>
                        <Button color="primary" type='submit'>Add</Button>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default SubAdmin