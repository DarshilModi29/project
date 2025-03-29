import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Button, Card, CardBody, CardTitle, CardSubtitle, Table, Modal, ModalBody, ModalFooter, Input, ModalHeader, Label, FormGroup, Form } from "reactstrap";
import config from '../components/Config';
import { useFormik } from 'formik';
import Cookies from 'js-cookie';
import { pricingSchema } from '../../schema';

const headings = ["", "Month", "Amount", "Action"];

const initVal = {
    amount: "",
    month: "",
}

const PricingModel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [pricing, setPricing] = useState([]);
    const [modelId, setModelId] = useState("");

    const toggleModal = () => {
        setIsOpen(!isOpen);
        setErrors({});
        setTouched({});
    }

    const handleClose = () => {
        setIsOpen(false);
        setErrors({});
        setModelId("");
        setTouched({});
        setValues(initVal);
    }

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, setValues, setFieldValue, setErrors, setTouched } = useFormik({
        initialValues: initVal,
        validationSchema: pricingSchema,
        onSubmit: async (values, action) => {
            const response =
                await fetch(modelId ?
                    `${config.SERVER_URL}/api/edit-premium-pricing/${modelId}` :
                    `${config.SERVER_URL}/api/add-premium-pricing`, {
                    method: modelId ? "PUT" : "POST",
                    body: JSON.stringify(values),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `bearer ${Cookies.get("jwt")}`
                    }
                });
            const data = await response.json();
            if (response.ok) {
                action.resetForm();
                getPricing();
                handleClose();
                config.alerts.success(data.message);
            } else {
                config.alerts.error(data.message);
            }
        }
    });

    const editPricingModel = async (id) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/get-premium-pricing/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setFieldValue("month", data.data.duration_month);
                setFieldValue("amount", data.data.amount);
                setModelId(id);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }

    const getPricing = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/show-premium-pricing`, {
                method: "GET",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPricing(data.data);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }, []);

    const removeModel = async (id) => {
        try {
            const isConfirmed = await config.alerts.confirm("Are you sure?", "This action cannot be undone.");
            if (isConfirmed) {
                const response = await fetch(`${config.SERVER_URL}/api/remove-premium-pricing/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `bearer ${Cookies.get("jwt")}`,
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    getPricing();
                    config.alerts.success(data.message);
                } else {
                    config.alerts.error(data.message);
                }
            }
        } catch (error) {
            console.log(error);
            config.alerts.error(error.toString());
        }
    }

    useEffect(() => {
        getPricing();
    }, [getPricing])


    return (
        <>
            <Row className='mt-3'>
                <Col lg="12">
                    <Card className='scrollable mb-0'>
                        <CardBody>
                            <div className="d-flex justify-content-between w-100">
                                <div>
                                    <CardTitle tag="h5">Pricing Models</CardTitle>
                                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                                        Different Pricing Models based on month duration
                                    </CardSubtitle>
                                </div>
                                <Button color='primary' className='h-50' onClick={() => {
                                    toggleModal();
                                    setValues(initVal);
                                    setModelId("");
                                }}><i className='bi bi-plus-lg'></i> Add</Button>
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
                                    {pricing?.map((price, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{price.duration_month}</td>
                                                <td>{price.amount}</td>
                                                <td>
                                                    <div className="d-flex justify-content-around">
                                                        <i className='bi bi-pencil text-primary' role="button" onClick={() => {
                                                            editPricingModel(price._id);
                                                            toggleModal();
                                                        }}></i>
                                                        <i className='bi bi-x-lg text-danger' role="button" onClick={() => removeModel(price._id)}></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                            {/* <PaginationData setActivePage={setActivePage} activePage={activePage} total={totalSubAdmins} /> */}
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
                            <Label for="month">Month</Label>
                            <Input name="month" className="remove-arrows" id="month" type='number' onChange={handleChange} onBlur={handleBlur} value={values.month} />
                            {
                                errors.month && touched.month ? (
                                    <p className='text-danger'>{errors.month}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="amount">Amount</Label>
                            <Input name="amount" className="remove-arrows" id="amount" type='number' onChange={handleChange} onBlur={handleBlur} value={values.amount} />
                            {
                                errors.amount && touched.amount ? (
                                    <p className='text-danger'>{errors.amount}</p>
                                ) : null
                            }
                        </FormGroup>
                        <Button color="primary" type='submit'>{modelId ? "Edit" : "Add"}</Button>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default PricingModel