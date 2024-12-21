import React, { useEffect, useState } from 'react'
import config from '../admin/components/Config';
import ShowImages from '../components/ShowImages';
import ReactSelect from '../components/ReactSelect';
import { useNavigate, useParams } from 'react-router-dom';

const limit = 10;

export default function Images() {
  const [images, setImages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [offset, setOffset] = useState(0);
  const { search } = useParams();
  const navigate = useNavigate();

  const searchImage = async () => {
    if (selectedTags && selectedTags.value) {
      navigate(`/images/${selectedTags.value}`);
      setImages([]);
    } else {
      setImages([]);
      navigate("/images/all");
    }
  }

  useEffect(() => {
    const getImages = async () => {
      try {
        const response = await fetch(search === "all" ? `${config.SERVER_URL}/api/images?limit=${limit}&offset=${offset}` : `${config.SERVER_URL}/api/searchImage/${search}`);
        const data = await response.json();
        if (response.ok) {
          setImages((prev) => [...prev, ...data.data]);
          setTotalImages(data.totalImages);
        }
        else {
          alert(data.message);
        }
      } catch (error) {
        alert(error.toString());
        console.log(error);
      }
    }
    getImages();
  }, [search, offset]);
  return (
    <>
      <div className="container">
        <div className="mb-4 d-flex justify-content-center w-100">
          <ReactSelect isClear={true} isMulti={false} className="w-50 shadow-sm" placeholder="Search for Image..." selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
          <button className="ms-2 shadow-sm btn btn-grey" onClick={() => searchImage()}>Search</button>
        </div>
      </div>
      <ShowImages images={images} page={"images"} limit={limit} setOffset={setOffset} totalImages={totalImages} />
    </>
  )
}
