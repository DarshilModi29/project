import { Table } from 'reactstrap';
import React from 'react'
import TextTruncateWithModal from './dashboard/TextTruncateWithModal';
import Cookies from 'js-cookie';

const ImageTable = ({ children, getImages, headings, images, config }) => {

    const hideImage = async (id, action) => {
        const response = await fetch(`${config.SERVER_URL}/api/imageHide/${id}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `bearer ${Cookies.get("jwt")}`
            },
            body: JSON.stringify({ action })
        });
        const data = await response.json();
        if (response.ok) {
            getImages();
            config.alerts.success(data.message);
        } else {
            config.alerts.error(data.message || "Error Hiding Image");
        }
    }

    return (
        <>
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
                    {
                        images?.map((image, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="text-center">
                                        <img role="button" src={`${config.SERVER_URL}/${image.url}`} alt={""}
                                            height={50} width={50} onClick={() => window.open(`${config.SERVER_URL}/${image.url}`, '_blank')} />
                                    </td>
                                    <td>{image.user.username}</td>
                                    <TextTruncateWithModal data={image.tags.join(", ")} />
                                    <TextTruncateWithModal data={image.description} />
                                    <td>{image.imageSize}mb</td>
                                    <td>{image.rating}</td>
                                    <td>{image.downloads}</td>
                                    <td className='text-center'>
                                        <i className={`${!image.isHide ? "bi bi-eye-slash text-danger" : "bi bi-eye text-primary"} fs-5`}
                                            title={`${!image.isHide ? "Hide" : "Unhide"}`}
                                            role="button"
                                            onClick={() => hideImage(image._id, !image.isHide ? "hide" : "unhide")}>
                                        </i>
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </Table>
            {children ? children : null}
        </>
    )
}

export default ImageTable