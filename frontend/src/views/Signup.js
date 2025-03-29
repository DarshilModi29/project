import React, { useState } from 'react';
import { useFormik } from 'formik';
import { registerSchema, extensionFilter } from '../schema';
import config from "../admin/components/Config";
import { useNavigate } from 'react-router-dom';

const initVal = {
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
};

// Inline CSS styles
const styles = {
  container: {
    fontFamily: '"Poppins", sans-serif',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    borderRadius: '10px',
    background: '#fff',
    padding: '30px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 30px 60px 0 rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  header: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '600',
    textTransform: 'uppercase',
    display: 'inline-block',
    margin: '40px 8px 10px 8px',
  },
  active: {
    color: '#0d0d0d',
    borderBottom: '2px solid #5fbae9',
  },
  input: {
    backgroundColor: '#f6f6f6',
    border: '2px solid #f6f6f6',
    color: '#0d0d0d',
    padding: '15px 32px',
    textAlign: 'center',
    fontSize: '16px',
    margin: '5px',
    width: '85%',
    borderRadius: '5px',
    transition: 'all 0.5s ease-in-out',
  },
  inputFocus: {
    backgroundColor: '#fff',
    borderBottom: '2px solid #5fbae9',
  },
  button: {
    backgroundColor: '#56baed',
    border: 'none',
    color: 'white',
    padding: '15px 80px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    textTransform: 'uppercase',
    fontSize: '13px',
    borderRadius: '5px',
    margin: '5px 20px 40px 20px',
    transition: 'all 0.3s ease-in-out',
  },
  buttonHover: {
    backgroundColor: '#39ace7',
  },
  buttonActive: {
    transform: 'scale(0.95)',
  },
  formFooter: {
    backgroundColor: '#f6f6f6',
    borderTop: '1px solid #dce8f1',
    padding: '25px',
    textAlign: 'center',
    borderRadius: '0 0 10px 10px',
  },
  underlineHover: {
    display: 'block',
    left: '0',
    bottom: '-10px',
    width: '0',
    height: '2px',
    backgroundColor: '#56baed',
    content: '""',
    transition: 'width 0.2s',
  },
  underlineHoverHover: {
    width: '100%',
  },
  fadeIn: {
    animation: 'fadeIn ease-in 1s',
    opacity: 0,
    animationFillMode: 'forwards',
  },
  fadeInDelay: (delay) => ({
    animationDelay: `${delay}s`,
  }),
  icon: {
    width: '60%',
  },
};

const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const underlineHoverKeyframes = `
  @keyframes underlineHover {
    from { width: 0; }
    to { width: 100%; }
  }
`;

const SignUp = () => {

  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicError, setProfilePicError] = useState("");

  const formik = useFormik({
    initialValues: initVal,
    validationSchema: registerSchema,
    onSubmit: async (values, action) => {
      if (profilePic && !extensionFilter(profilePic)) {
        setProfilePicError("Only jpg, jpeg and png files are accepted");
      } else {
        const formData = new FormData();
        formData.append('profilePic', profilePic);
        formData.append('username', values.username);
        formData.append('email', values.email);
        formData.append('password', values.password)
        formData.append('confirmPassword', values.confirmPassword);

        const response = await fetch(`${config.SERVER_URL}/auth/registration`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          config.alerts.success(data.message);
          action.resetForm();
          setProfilePic(null);
          setProfilePicError("");
          navigate("/login");
        } else {
          config.alerts.error(data.message);
        }
      }
    }
  });

  return (
    <div style={styles.container}>
      <style>
        {`
          ${fadeInKeyframes}
          ${underlineHoverKeyframes}
        `}
      </style>
      <div style={styles.formContent}>
        <h2 style={{ ...styles.header, ...styles.active }}>Sign Up</h2>
        <form onSubmit={formik.handleSubmit}>
          <input
            type="file"
            style={styles.input}
            className='form-control d-inline'
            onChange={(e) => {
              setProfilePic(e.target.files[0]);
              setProfilePicError("");
            }}
          />
          {profilePicError ? <p className="text-danger">{profilePicError}</p> : null}
          <input
            type="text"
            style={styles.input}
            placeholder="Username"
            name='username'
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {
            formik.errors.username && formik.touched.username ? (
              <p className='text-danger'>{formik.errors.username}</p>
            ) : null
          }
          <input
            type="email"
            style={styles.input}
            placeholder="Email"
            name='email'
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {
            formik.errors.email && formik.touched.email ? (
              <p className='text-danger'>{formik.errors.email}</p>
            ) : null
          }
          <input
            type="password"
            style={styles.input}
            placeholder="Password"
            name='password'
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {
            formik.errors.password && formik.touched.password ? (
              <p className='text-danger'>{formik.errors.password}</p>
            ) : null
          }
          <input
            type="password"
            style={styles.input}
            placeholder="Confirm Password"
            name='confirmPassword'
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {
            formik.errors.confirmPassword && formik.touched.confirmPassword ? (
              <p className='text-danger'>{formik.errors.confirmPassword}</p>
            ) : null
          }
          <button
            type="submit"
            style={styles.button}
          > Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
