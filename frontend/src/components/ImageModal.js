import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import config from '../admin/components/Config';
import { Rating } from 'react-simple-star-rating';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const ImageModal = ({ imageId, rating, src, modal, toggle, imageSize, closeModal, downloadImage, onlyPremium }) => {
    const [qualityData, setQualityData] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [readonly, setReadonly] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const toggleDropdown = () => setDropdownOpen(prevState => !prevState);
    const image = src.split("/").at(-1);

    const navigate = useNavigate();

    const handleRating = async (rate) => {
        try {
            const response = await fetch(`${config.SERVER_URL}/api/set_ratings/${imageId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${Cookies.get('jwt')}`
                },
                body: JSON.stringify({ ratings: rate })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
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
    }

    useEffect(() => {
        const isRated = async () => {
            try {
                const response = await fetch(`${config.SERVER_URL}/api/isRated/${imageId}`, {
                    headers: {
                        'Authorization': `bearer ${Cookies.get('jwt')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    if (data.data && data.data.image === imageId) {
                        setReadonly(true);
                        setRatingValue(data.data.ratings);
                    } else {
                        setReadonly(false);
                        setRatingValue(0);
                    }
                }
            } catch (error) {
                console.log(error);
                alert(error.toString());
            }
        }

        const getQuality = () => {
            const quality = [2400, 1920, 640];
            const size = ["Large", "Medium", "Small"];
            const width = parseInt(imageSize.split("x")[0]);
            const height = parseInt(imageSize.split("x")[1]);
            const imageQuality = [];
            quality.forEach((qlty, index) => {
                const data = {};
                const downloadHeight = (height * qlty) / width;
                data.size = size[index];
                data.width = qlty;
                data.height = Math.round(downloadHeight);
                imageQuality.push(data);
            });
            return imageQuality;
        }

        if (modal) {
            const quality = getQuality();
            setQualityData(quality);
            if (Cookies.get("jwt")) {
                isRated();
            }
        }
    }, [modal, imageSize, imageId])

    return (
        <div>
            <Modal isOpen={modal} toggle={toggle} backdrop={"static"} keyboard={false} centered>
                <ModalFooter className='border-bottom'>
                    <div>
                        {
                            onlyPremium && !Cookies.get("isPremium") ? (
                                <Button color="white" className='border-dark' onClick={() => navigate("/premium")}>
                                    <i className='bi bi-lock-fill'></i>
                                </Button>
                            ) : (
                                <ButtonGroup>
                                    <Button color='white' className='border-dark' onClick={(e) => downloadImage(e, image, imageSize)}>Download</Button>
                                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                                        <DropdownToggle caret color='white' className='border-dark border-start-0 rounded-0 rounded-end-1'></DropdownToggle>
                                        <DropdownMenu style={{ fontSize: "0.88rem" }}>
                                            {
                                                qualityData.map((data, index) => {
                                                    const disabled = !Cookies.get("isPremium") && (data.size === "Small" || data.size === "Medium") ? false : Cookies.get("isPremium") ? false : true;
                                                    return (
                                                        <DropdownItem disabled={disabled} key={index} onClick={(e) => downloadImage(e, image, `${data.width}x${data.height}`)}>{data.size} ({data.width}x{data.height})</DropdownItem>
                                                    )
                                                })
                                            }
                                            <DropdownItem divider />
                                            <DropdownItem disabled={!Cookies.get("isPremium")} onClick={(e) => downloadImage(e, image, imageSize)}>Original ({imageSize})</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </ButtonGroup>
                            )
                        }
                    </div>
                </ModalFooter>
                <ModalBody className='px-5'>
                    <img
                        src={`${config.SERVER_URL}/${src}`}
                        alt={"Card"}
                        className='img-fluid'
                        style={{ cursor: 'pointer' }}
                    />
                    <p className='mt-3'><strong>Average Ratings:</strong>
                        <Rating readonly onClick={function noRefCheck() { }} initialValue={rating} allowFraction />
                    </p>
                    <strong>Your Ratings: </strong><Rating onClick={handleRating} readonly={readonly} initialValue={ratingValue ? ratingValue : 0} transition />
                </ModalBody>
                <ModalFooter>
                    <Button type='button' onClick={closeModal} color='primary'>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ImageModal;
