import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Button, Card, CardBody, CardTitle, CardSubtitle, Modal, ModalBody, ModalFooter, Input, ModalHeader, Label, FormGroup, Form } from "reactstrap";
import { useNavigate } from "react-router-dom";
import config from '../components/Config';
import { useFormik } from 'formik';
import Cookies from "js-cookie";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { contestSchema } from '../../schema';
import { date } from 'yup';

const initVal = {
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    contest_size: null,
    rules: "",
    prize_money: null,
};

const Contest = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [contests, setContests] = useState([]);
    const [contestId, setContestId] = useState("");
    const navigate = useNavigate();

    const toggleModal = () => {
        setIsOpen(!isOpen);
        setErrors({});
        setTouched({});
    }

    const handleClose = () => {
        setErrors({});
        setIsOpen(false);
        setTouched({});
        setContestId("");
        setValues(initVal);
    }

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, setValues, setFieldValue, setFieldTouched, setErrors, setTouched } = useFormik({
        initialValues: initVal,
        validationSchema: contestSchema,
        onSubmit: async (values, action) => {
            try {
                if (contestId) {
                    const response = await fetch(`${config.SERVER_URL}/api/edit-contest/${contestId}`, {
                        method: "PATCH",
                        body: JSON.stringify(values),
                        headers: {
                            "Authorization": `bearer ${Cookies.get("jwt")}`,
                            "Content-type": "application/json"
                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        action.resetForm();
                        fetchContests();
                        handleClose();
                        alert(data.message);
                    } else {
                        alert(data.message);
                    }
                } else {
                    const response = await fetch(`${config.SERVER_URL}/api/create-contest`, {
                        method: "POST",
                        body: JSON.stringify(values),
                        headers: {
                            "Authorization": `bearer ${Cookies.get("jwt")}`,
                            "Content-type": "application/json"
                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        action.resetForm();
                        fetchContests();
                        handleClose();
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
    });

    const editContest = async (id) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/contest/${id}`);
            const data = await response.json();
            if (response.ok) {
                setContestId(data.data._id);
                setFieldValue("title", data.data.title);
                setFieldValue("description", data.data.description);
                setFieldValue("start_date", data.data.start_date.split("T")[0])
                setFieldValue("end_date", data.data.end_date.split("T")[0])
                setFieldValue("rules", data.data.rules);
                setFieldValue("contest_size", data.data.contest_size);
                setFieldValue("prize_money", data.data.prize_money);
            }
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    const deleteContest = async (id) => {
        try {
            if (window.confirm("Are you sure to delete this contest?")) {
                const response = await fetch(`${config.SERVER_URL}/api/delete-contest/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `bearer ${Cookies.get("jwt")}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    fetchContests();
                } else {
                    alert(date.message);
                }
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }

    const fetchContests = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/all-contests`);
            const data = await response.json();
            if (response.ok) {
                setContests(data.data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }, []);

    useEffect(() => {
        fetchContests();
    }, [fetchContests]);

    return (
        <>
            <Row className='mt-3'>
                <Col lg="12">
                    <Card className='scrollable mb-0'>
                        <CardBody>
                            <div className="d-flex justify-content-between w-100">
                                <div>
                                    <CardTitle tag="h5">Contests</CardTitle>
                                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                                        All Contests
                                    </CardSubtitle>
                                </div>
                                <Button color='primary' className='h-50' onClick={() => {
                                    toggleModal();
                                    setValues(initVal);
                                    setContestId("");
                                }}><i className='bi bi-plus-lg'></i> Add</Button>
                            </div>

                            {
                                contests?.map((con, index) => {
                                    const stat_class = con.status === "Not Started" ?
                                        "text-primary" : con.status === "Canceled" ?
                                            "text-danger" : "text-success";
                                    return (
                                        <div key={index} className="bg-light p-3 rounded mt-2">
                                            <Row>
                                                <Col md="8">
                                                    <p className="m-0 h5">{con.title}</p>
                                                    <p className='m-0 mb-2'>{con.description}</p>
                                                    <hr className='my-2' />
                                                    <p className={`fw-bold ${stat_class}`} style={{ fontSize: "1.1rem" }}>{con.status}</p>
                                                </Col>
                                                <Col md="4">
                                                    <p className='h6'>Contest Size: {con.joined}/{con.contest_size}</p>
                                                    <p className='h6'>Prize Money: ₹{con.prize_money}</p>
                                                    <hr className='my-2' />
                                                    <p className='h6'>Start: {new Date(con.start_date).toLocaleDateString('en-GB')}</p>
                                                    <p className='h6'>End: {new Date(con.end_date).toLocaleDateString('en-GB')}</p>
                                                </Col>
                                            </Row>
                                            {
                                                con.winner ?
                                                    <div className="text-center h4 text-primary">Winner: {con.winner}</div>
                                                    : ""
                                            }
                                            <Button color='primary' className='me-1' onClick={() => {
                                                navigate(`/contest-details?id=${con._id}`)
                                            }}>More Details</Button>
                                            <Button color='warning' className='me-1' onClick={() => {
                                                editContest(con._id);
                                                toggleModal();
                                            }}>Edit</Button>
                                            <Button color='danger' onClick={() => deleteContest(con._id)}>Delete</Button>
                                        </div>
                                    )
                                })
                            }
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Modal isOpen={isOpen} toggle={toggleModal}>
                <ModalHeader>
                    {contestId ? "Edit Contest" : "Add Contest"}
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="title">Title</Label>
                            <Input name="title" className='shadow-none' id="title" type='text' onChange={handleChange} onBlur={handleBlur} value={values.title} />
                            {
                                errors.title && touched.title ? (
                                    <p className='text-danger'>{errors.title}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input name="description" className='shadow-none' id="description" type='textarea' onChange={handleChange} onBlur={handleBlur} value={values.description} />
                            {
                                errors.description && touched.description ? (
                                    <p className='text-danger'>{errors.description}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="start_date">Start Date</Label>
                            <Input min={new Date().toISOString().split("T")[0]} name="start_date" className='shadow-none' id="start_date" type='date' onChange={handleChange} onBlur={handleBlur} value={values.start_date} />
                            {
                                errors.start_date && touched.start_date ? (
                                    <p className='text-danger'>{errors.start_date}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="end_date">End Date</Label>
                            <Input min={values.start_date} name="end_date" className='shadow-none' id="end_date" type='date' onChange={handleChange} onBlur={handleBlur} value={values.end_date} />
                            {
                                errors.end_date && touched.end_date ? (
                                    <p className='text-danger'>{errors.end_date}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="rules">Rules</Label>
                            <ReactQuill
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ['bold', 'italic', 'underline'],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ['link'],
                                    ],
                                }}
                                onChange={(value) => {
                                    setFieldValue('rules', value);
                                }}
                                onBlur={() => setFieldTouched('rules', true)}
                                value={values.rules}
                                name="rules"
                                id="rules"
                                theme="snow"
                            />
                            {
                                errors.rules && touched.rules ? (
                                    <p className='text-danger'>{errors.rules}</p>
                                ) : null
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label for="contest_size">Contest Size (Optional)</Label>
                            <Input type="number" onChange={handleChange} className='remove-arrows shadow-none' onBlur={handleBlur} value={values.contest_size} id="contest_size" name="contest_size" />
                            {
                                errors.contest_size && touched.contest_size ? (
                                    <p className='text-danger'>{errors.contest_size}</p>
                                ) : null
                            }
                            <small className="text-muted">If not given 100 size will be considered</small>
                        </FormGroup>
                        <FormGroup>
                            <Label for="prize_money">Prize Money (Optional)</Label>
                            <Input type="number" className='remove-arrows shadow-none' onChange={handleChange} onBlur={handleBlur} value={values.prize_money} id="prize_money" name="prize_money" />
                            {
                                errors.prize_money && touched.prize_money ? (
                                    <p className='text-danger'>{errors.prize_money}</p>
                                ) : null
                            }
                        </FormGroup>
                        <Button color="primary" className='shadow-none' type='submit'>{contestId ? "Edit" : "Add"}</Button>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default Contest