import React, { useEffect, useState } from 'react';
import config from '../admin/components/Config';
import ImageModal from './ImageModal';
import Cookies from 'js-cookie';
import { saveAs } from 'file-saver';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Modal, ModalHeader, ModalFooter, ModalBody, Button } from 'reactstrap';
import { useNavigate } from "react-router-dom"
import ReactSelect from "./ReactSelect";

const ShowImages = ({ fetchUserImages, limit, images, page = "", getSavedImages = () => null, setOffset = () => null, totalImages = 0 }) => {

    const navigate = useNavigate();
    const [modal, setModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [source, setSource] = useState("");
    const [imgSize, setImgSize] = useState("");
    const [ratings, setRatings] = useState("");
    const [imageId, setImageId] = useState("");
    const [savedImages, setSavedImages] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [onlyForPremium, setOnlyForPremium] = useState("");
    const [updatedImageId, setUpdatedImageId] = useState("");

    const formatTag = (tag) => {
        return tag
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const getSaved = async () => {
            try {
                const response = await fetch(`${config.SERVER_URL}/api/checkSaved`, {
                    headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setSavedImages(data.data);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.log(error);
                alert(error.toString());
            }
        };

        if (Cookies.get("jwt")) {
            getSaved();
        }

    }, []);

    const downloadImage = async (e, file, quality) => {
        try {
            e.stopPropagation();
            const image = file.split("/").at(-1);
            const response = await fetch(`${config.SERVER_URL}/api/downloadImage?filename=${image}&quality=${quality}`, {
                method: "POST",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                saveAs(blob, image);
            } else {
                const data = await response.json();
                if (response.status === 401) {
                    alert(data.message);
                    navigate("/login");
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    };

    const unsaveImage = async (e, id) => {
        try {
            e.stopPropagation();
            const response = await fetch(`${config.SERVER_URL}/api/unsaved/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                if (page === "savedImages") {
                    getSavedImages();
                }
                setSavedImages(prev => prev.filter(imageId => imageId !== id));
            } else {
                if (response.status === 401) {
                    alert(data.message);
                    navigate("/login");
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            alert(error.toString());
            console.log(error);
        }
    };

    const saveImage = async (e, id) => {
        try {
            e.stopPropagation();
            const response = await fetch(`${config.SERVER_URL}/api/save_image/${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setSavedImages(prev => [...prev, id]);
            } else {
                if (response.status === 401) {
                    alert(data.message);
                    navigate("/login");
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            alert(error.toString());
            console.log(error);
        }
    };

    const toggle = (id, imgSrc, imageSize, rating, onlyPremium) => {
        setModal(!modal);
        setImageId(id);
        setSource(imgSrc);
        setImgSize(imageSize);
        setRatings(rating);
        setOnlyForPremium(onlyPremium);
    };

    const toggleModal = async (e, id) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
        setUpdatedImageId(id);
        try {
            const response = await fetch(`${config.SERVER_URL}/api/image/${id}`, {
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.data);
                setDescription(data.data.description);
                const mappedTags = data.data.tags.map(tag => ({
                    label: formatTag(tag),
                    value: tag
                }));
                setSelectedTags(mappedTags);
                setImageUrl(data.data.url);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }

    }

    const closeModal = () => {
        setIsOpen(false);
        setUpdatedImageId("");
        setDescription("");
        setImageUrl("");
        setSelectedTags("");
    }

    const updateImage = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${config.SERVER_URL}/api/updateImage/${updatedImageId}`, {
                method: 'PATCH',
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    description: description,
                    tags: selectedTags
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                closeModal();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert(error.toString());
        }
    }

    const deleteImage = async (e, id) => {
        try {
            e.stopPropagation();
            const response = await fetch(`${config.SERVER_URL}/api/deleteImage/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `bearer ${Cookies.get("jwt")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchUserImages();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert(error.toString());
            console.log(error);
        }
    }

    const handleClose = () => {
        setModal(false);
        setImgSize("");
        setSource("");
        setRatings("");
        setImageId("");
    };

    const renderImage = (image, index) => {
        return (
            <div className="card h-100 border-0 shadow" key={index}>
                <div className="card-body p-0 img-body" onClick={() => toggle(image._id, image.url, image.resolution, image.rating, image.onlyPremium)}>
                    <div className="position-relative">
                        <img
                            className="card-img-top"
                            src={`${config.SERVER_URL}/${image.isHide ? "images/other/hiddenImage.jpg" : image.url}`}
                            alt={`Card ${index + 1}`}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                        {image.isHide ? null : page !== "user" ? (
                            <>
                                <div className='overlay overlay-position'>
                                    {
                                        image.onlyPremium && Cookies.get("isPremium") ? (
                                            <>
                                                <button
                                                    className='btn btn-light shadow-none me-1'
                                                    onClick={(e) => savedImages.includes(image._id) ? unsaveImage(e, image._id) : saveImage(e, image._id)}
                                                >
                                                    <i className={`bi ${savedImages.includes(image._id) ? "bi-bookmark-fill" : "bi-bookmark"}`}></i>
                                                </button>
                                                <button className='btn btn-light shadow-none' onClick={(e) => downloadImage(e, image.url, image.resolution)}>
                                                    <i className='bi bi-arrow-down'></i>
                                                </button>
                                            </>
                                        ) :
                                            image.onlyPremium && !Cookies.get("isPremium") ? (
                                                <>
                                                    <button
                                                        className='btn btn-light shadow-none me-1'
                                                        onClick={() => navigate("/premium")}
                                                    >
                                                        <i className={`bi bi-bookmark`}></i>
                                                    </button>
                                                    <button className='btn btn-light shadow-none' onClick={() => navigate("/premium")}>
                                                        <i class="bi bi-lock-fill"></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className='btn btn-light shadow-none me-1'
                                                        onClick={(e) => savedImages.includes(image._id) ? unsaveImage(e, image._id) : saveImage(e, image._id)}
                                                    >
                                                        <i className={`bi ${savedImages.includes(image._id) ? "bi-bookmark-fill" : "bi-bookmark"}`}></i>
                                                    </button>
                                                    <button className='btn btn-light shadow-none' onClick={(e) => downloadImage(e, image.url, image.resolution)}>
                                                        <i className='bi bi-arrow-down'></i>
                                                    </button>
                                                </>
                                            )
                                    }
                                </div>
                                <div className="show-username show-username-position">
                                    <h5 className="text-light fs-4">{image.user.username}</h5>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='overlay overlay-position'>
                                    <button
                                        className='btn btn-primary shadow-none me-1'
                                        onClick={(e) => toggleModal(e, image._id)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className='btn btn-danger shadow-none' onClick={(e) => deleteImage(e, image._id)}>
                                        <i className='bi bi-trash'></i>
                                    </button>
                                </div>
                            </>
                        )
                        }
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {page === "images" ? (
                <InfiniteScroll
                    dataLength={images.length}
                    next={() => setOffset(prev => prev + limit)}
                    hasMore={images.length < totalImages}
                >
                    <div className="scrollblock">
                        <div className="container-fluid pt-10">
                            <div className="row justify-content-md-center">
                                <div className="col-md-10 col-sm-12">
                                    <div className="card-columns">
                                        {images?.map(renderImage)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </InfiniteScroll>
            ) : (
                <div className="scrollblock">
                    <div className="container-fluid pt-10">
                        <div className="row justify-content-md-center">
                            <div className="col-md-10 col-sm-12">
                                <div className="card-columns">
                                    {images?.map(renderImage)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ImageModal rating={ratings} imageId={imageId} downloadImage={downloadImage} src={source} toggle={toggle} modal={modal} imageSize={imgSize} closeModal={handleClose} onlyPremium={onlyForPremium} />
            <Modal isOpen={isOpen} toggle={toggleModal} size='lg'>
                <ModalHeader>Update Image</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-md-6">
                            <img src={`${config.SERVER_URL}/${imageUrl}`} className='img-fluid' alt='' />
                        </div>
                        <div className="col-md-6 d-flex align-items-center">
                            <form className='w-100'>
                                <div className="mb-3">
                                    <label className='form-label'>Tags</label>
                                    <ReactSelect isMulti={true} setSelectedTags={setSelectedTags} selectedTags={selectedTags} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className='form-label'>Descripiton</label>
                                    <textarea className='form-control shadow-none' value={description}
                                        onChange={(e) => setDescription(e.target.value)} id='description'
                                    >
                                    </textarea>
                                </div>
                                <button type='submit' className="btn btn-primary shadow-none" onClick={(e) => updateImage(e)}>Update</button>
                            </form>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={closeModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ShowImages;
