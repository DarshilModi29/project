import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Button, Card, CardBody, CardTitle, CardSubtitle, Table, Modal, ModalBody, ModalFooter, Input, ModalHeader, Label, FormGroup, Form } from "reactstrap";
import config from '../components/Config';
import { useFormik } from 'formik';
import { tagSchema } from '../../schema';
import Cookies from 'js-cookie';
import PaginationData from "../components/Pagination";

const headings = ["", "Tag", "Slug", "Counts", "Actions"]
const initVal = {
    tag_name: "",
}

const limit = 10;

const Tags = () => {

    const [tags, setTags] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [activePage, setActivePage] = useState(1);

    const isValidTag = (tag) => {
        const regex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?|\\]/;
        if (regex.test(tag))
            return false;

        return true;
    }

    const toggleModal = () => {
        setValues(initVal);
        setIsOpen(!isOpen);
    }

    const handleClose = () => {
        setValues(initVal);
        setIsOpen(false);
    }

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, setValues, setFieldError } = useFormik({
        initialValues: initVal,
        validationSchema: tagSchema,
        onSubmit: async (values, action) => {
            if (!isValidTag(values.tag_name)) {
                setFieldError("tag_name", "Tag can't contain any special characters");
            } else {
                const response = await fetch(`${config.SERVER_URL}/api/setTags`, {
                    method: "POST",
                    body: JSON.stringify(values),
                    headers: {
                        "Content-type": "application/json",
                        "Authorization": `bearer ${Cookies.get("jwt")}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    action.resetForm();
                    getTags();
                    handleClose();
                    config.alerts.success(data.message);
                } else {
                    config.alerts.error(data.message);
                }
            }
        }
    });

    const removeTag = async (id) => {
        const isConfirmed = await config.alerts.confirm("Are you sure?", "This action cannot be undone.");
        if (isConfirmed) {
            const response = await fetch(`${config.SERVER_URL}/api/removeTag/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                getTags();
                config.alerts.success(data.message);
            } else {
                config.alerts.error(data.message);
            }
        }
    }

    const getTags = useCallback(async () => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/allTags?limit=${limit}&page=${activePage}`, {
                headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTags(data.data);
                setTotal(data.totalTags);
            } else {
                config.alerts.error(data.message);
            }
        } catch (error) {
            config.alerts.error(error.toString());
            console.log(error);
        }
    }, [activePage]);

    useEffect(() => {
        getTags();
    }, [getTags])

    return (
        <>
            <Row className='mt-3'>
                <Col lg="12">
                    <Card className='scrollable mb-0'>
                        <CardBody>
                            <div className="d-flex justify-content-between w-100">
                                <div>
                                    <CardTitle tag="h5">Tags</CardTitle>
                                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                                        Tags for Images
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
                                    {tags?.map((tag, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{tag.name}</td>
                                                <td>{tag.slug}</td>
                                                <td>{tag.counts}</td>
                                                <td>
                                                    <div className="d-flex justify-content-around">
                                                        <i className='bi bi-x-lg text-danger' role="button" onClick={() => removeTag(tag._id)}></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                            <PaginationData total={total} setActivePage={setActivePage} activePage={activePage} />
                        </CardBody>
                    </Card>
                </Col>
            </Row >
            <Modal isOpen={isOpen} toggle={toggleModal}>
                <ModalHeader>
                    Add Tag
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <ModalBody>
                        <FormGroup>
                            <Label for="username">Tag Name</Label>
                            <Input name="tag_name" id="tag_name" type='text' onChange={handleChange} onBlur={handleBlur} value={values.tag_name} />
                            {
                                errors.tag_name && touched.tag_name ? (
                                    <p className='text-danger'>{errors.tag_name}</p>
                                ) : null
                            }
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" type='submit'>Add</Button>
                        <Button color="primary" onClick={handleClose}>Cancel</Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </>
    )
}

export default Tags;