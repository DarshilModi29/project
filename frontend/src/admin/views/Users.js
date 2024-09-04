import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Table, Modal, ModalBody, ModalFooter, Button, Input } from 'reactstrap';
import config from '../components/Config';
import PaginationData from '../components/Pagination';
import Cookies from 'js-cookie';

const headings = ["", "Profile Pic", "Username", "Email", "Status", "Actions"];
const limit = 10;

const Users = () => {

  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [suspendDays, setSuspendDays] = useState(1);
  const [modal, setModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activePage, setActivePage] = useState(1);

  const toggleModal = (id) => {
    setUserId(id);
    setModal(!modal);
  };

  const suspendUser = async () => {
    const response = await fetch(`${config.SERVER_URL}/api/suspendUser/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${Cookies.get("jwt")}`
      },
      body: JSON.stringify({ days: suspendDays })
    });
    const data = await response.json();

    if (response.ok) {
      getAllUsers();
      setModal(false);
      alert(data.message);
    } else {
      alert(data.message || "Error suspending user");
    }
  }

  const removeSuspension = async (id) => {
    const response = await fetch(`${config.SERVER_URL}/api/removeSuspension/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `bearer ${Cookies.get("jwt")}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      getAllUsers();
      alert(data.message);
      setSuspendDays(1);
    } else {
      alert(data.message || "Error removing suspension");
    }
  }

  const userBan = async (id, action) => {
    const response = await fetch(`${config.SERVER_URL}/api/userBan/${id}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `bearer ${Cookies.get("jwt")}`
      },
      body: JSON.stringify({ action })
    });
    const data = await response.json();
    if (response.ok) {
      getAllUsers();
      alert(data.message);
    } else {
      alert(data.message || "Error banning user");
    }
  }

  const getAllUsers = useCallback(async () => {
    try {
      const response = await fetch(`${config.SERVER_URL}/api/allUsers?limit=${limit}&page=${activePage}`, {
        headers: { "Authorization": `bearer ${Cookies.get("jwt")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.data);
        setTotalUsers(data.totalUsers);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error.toString());
      console.log(error);
    }
  }, [activePage]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers])
  return (
    <>
      <Row>
        <Col lg="12">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Users</CardTitle>
              <CardSubtitle className="mb-2 text-muted" tag="h6">
                Registered Users
              </CardSubtitle>

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
                  {users?.map((user, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-center">
                          <img role="button" src={`${config.SERVER_URL}/${user.profilePic}`} alt={""}
                            height={50} width={50} onClick={() => window.open(`${config.SERVER_URL}/${user.profilePic}`, '_blank')} />
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.isActive ? (
                          <span className="p-2 bg-success rounded-circle d-inline-block ms-3"></span>
                        ) : (
                          <span className="p-2 bg-danger rounded-circle d-inline-block ms-3"></span>
                        )}</td>
                        <td>
                          <div className="d-flex justify-content-around">
                            <i className={`${!user.isSuspend ? "bi bi-stopwatch" : "bi bi-check-circle"} text-warning fs-5`} title='Suspend' role="button" onClick={!user.isSuspend ? () => toggleModal(user._id) : () => removeSuspension(user._id)}></i>
                            <i className={`${!user.isBanned ? "bi bi-ban" : "bi bi-unlock"} text-danger fs-5`} title='Ban' role="button" onClick={() => userBan(user._id, !user.isBanned ? "ban" : "unban")}></i>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
              <PaginationData total={totalUsers} setActivePage={setActivePage} activePage={activePage} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalBody>
          <h5>Enter number of days to suspend user:</h5>
          <Input
            type="number"
            value={suspendDays}
            onChange={(e) => setSuspendDays(e.target.value)}
            min="1"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={suspendUser}>Suspend</Button>{' '}
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Users;
