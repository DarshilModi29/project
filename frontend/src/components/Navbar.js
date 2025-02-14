import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, FormGroup, Input, Modal, ModalBody, ModalHeader, ModalFooter, Label } from 'reactstrap';
import config from '../admin/components/Config';
import Dropzone from './Dropzone';
import ReactSelect from './ReactSelect';

const routes = [{
  path: '/',
  component: "Home",
},
{
  path: "/images/all",
  component: "Images",
},
{
  path: "/inquiry",
  component: "Inquiry",
},
{
  path: "/about",
  component: "About",
},
{
  path: "/contest",
  component: "Contest",
}];

const Navbar = () => {

  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleClose = () => {
    setImages([]);
    setIsOpen(false);
  }

  const toggleModal = () => {
    setImages([]);
    setIsOpen(!isOpen);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('images', images[0]);
    formData.append('tags', JSON.stringify(selectedTags))
    formData.append('description', description);

    const response = await fetch(`${config.SERVER_URL}/api/uploadImage`, {
      method: 'POST',
      body: formData,
      headers: {
        "Authorization": `bearer ${Cookies.get("jwt")}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      setImages([]);
      setDescription("");
      setSelectedTags([]);
      handleClose();
      alert(data.message)
    } else {
      if (response.status === 401) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message)
      }
    }
  }

  const Logout = () => {
    Cookies.remove("jwt");
    Cookies.remove("profilePic");
    Cookies.remove("role");
    Cookies.remove("isPremium");
    navigate("/");
  }
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-black-50 sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand" style={{ maxWidth: "170px" }} to="/"><img className='img-fluid' src="http://localhost:5000/images/other/logo.png" alt="Logo" /></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {
                routes.map((route, index) => {
                  return (
                    <li className="nav-item" key={index}>
                      <Link className="nav-link" to={route.path}>{route.component}</Link>
                    </li>
                  )
                })
              }
            </ul>
            <div className="d-flex align-items-center justify-content-center">
              {Cookies.get("jwt") && Cookies.get("role") === "user"
                ?
                <>
                  <li className="nav-item list-unstyled">
                    <Link to="/premium" className='nav-link p-2'>Infinite+</Link>
                  </li>
                  <li className="nav-item list-unstyled">
                    <Link to="/infinite-pro" className='p-2 me-2 nav-link'>Infinite Pro</Link>
                  </li>
                  <Button type='button' onClick={toggleModal} className='me-2 border border-white shadow-none text-white' color='white'>Upload an Image</Button>
                  <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle color='transperant' className='shadow-none'>
                      <img
                        src={`${config.SERVER_URL}/${Cookies.get("profilePic")}`}
                        alt="profile"
                        className="rounded-circle"
                        width="40"
                        height="30"
                      ></img>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem header>Info</DropdownItem>
                      <DropdownItem><Link to="/profile">My Account</Link></DropdownItem>
                      <DropdownItem onClick={Logout}>Logout</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </>
                :
                (
                  <>
                    <Link className="btn btn-primary me-2 rounded text-white" to="/login">Login</Link>
                    <Link className="btn btn-secondary rounded text-white" to="/register">Register</Link>
                  </>
                )
              }
            </div>
          </div>
        </div>
      </nav>
      <Modal isOpen={isOpen} toggle={toggleModal}>
        <ModalHeader>Upload Image</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Dropzone id="images" files={images} setFiles={setImages} multiple={false} />
            <FormGroup>
              <Label>Tags</Label>
              <ReactSelect isMulti={true} placeholder="Enter Tags..." selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input type='textarea' className='shadow-none py-1 px-2' value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type='submit'>Upload</Button>
            <Button type='button' color='secondary' onClick={handleClose}>Cancel</Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};

export default Navbar;
