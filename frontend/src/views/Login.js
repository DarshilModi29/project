import React from 'react';
import { signinSchema } from '../schema';
import { useFormik } from 'formik';
import config from '../admin/components/Config';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const initVal = {
  email: "",
  password: "",
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
    margin: '10px 20px',
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

const Login = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: initVal,
    validationSchema: signinSchema,
    onSubmit: async (values, action) => {
      const response = await fetch(`${config.SERVER_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        if (data && data.data) {
          action.resetForm();
          Cookies.set("jwt", data.token, { expires: 730 });
          Cookies.set("role", `${data.data.role}`, { expires: 730 });
          Cookies.set("profilePic", data.data.profilePic, { expires: 730 });
          navigate("/");
        } else {
          config.alerts.error(data.message);
        }
      } else {
        config.alerts.error(data.message);
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
        <h2 style={{ ...styles.header, ...styles.active }}>Sign In</h2>
        <div style={{ width: '60%', margin: '0 auto' }}>

        </div>
        <form onSubmit={formik.handleSubmit}>
          <input
            type="text"
            style={styles.input}
            placeholder="Login"
            name='email'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          <input
            type="password"
            style={styles.input}
            placeholder="Password"
            name='password'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          <input
            type="submit"
            style={styles.button}
            value="Log In"
          />
        </form>
        <small className="text-center">Don't remember password? <Link to="/forgot-password" className="text-primary text-decoration-underline">Forgot Password</Link></small>
      </div>
    </div>
  );
};

export default Login;
