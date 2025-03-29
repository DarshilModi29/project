import { useFormik } from 'formik';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { inquirySchema } from '../schema';
import config from '../admin/components/Config';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const initVal = {
  inquireFor: "",
  description: "",
  purpose: ""
}
const Inquiry = () => {

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: initVal,
    validationSchema: inquirySchema,
    onSubmit: async (values, action) => {
      if (!stripHtml(values.description)) {
        formik.setFieldError("description", "Please describe your Image or Tag");
      } else if (stripHtml(values.description).trim().length === 0) {
        formik.setFieldError("description", "White space is not allowed");
      } else {
        const response = await fetch(`${config.SERVER_URL}/api/inquire`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `bearer ${Cookies.get("jwt")}`
          },
          body: JSON.stringify(values)
        });

        const data = await response.json();
        if (response.ok) {
          config.alerts.success(data.message);
          action.resetForm();
        } else {
          if (response.status === 401) {
            config.alerts.error(data.message);
            navigate("/login");
          } else {
            config.alerts.error(data.message)
          }
        }
      }
    }
  })

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-sm-12">
          <div className="card shadow-lg border-0 rounded">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4">Inquire for an Image or Tag</h3>
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="inquireFor" className='form-label'>Inquiry for</label>
                  <select name="inquireFor" className='form-control shadow-none' id="inquireFor"
                    value={formik.values.inquireFor} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  >
                    <option value="">Select One</option>
                    <option value="Image">Image</option>
                    <option value="Tag">Tag</option>
                  </select>
                  {
                    formik.errors.inquireFor && formik.touched.inquireFor && (
                      <p className='text-danger'>{formik.errors.inquireFor}</p>
                    )
                  }
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <ReactQuill
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['link'],
                      ],
                    }}
                    onChange={(value) => {
                      formik.setFieldValue('description', value);
                    }}
                    onBlur={() => formik.setFieldTouched('description', true)}
                    value={formik.values.description}
                    name="description"
                    id="description"
                    theme="snow"
                  />
                  {
                    formik.errors.description && formik.touched.description && (
                      <p className="text-danger mb-0">{formik.errors.description}</p>
                    )
                  }
                  <small className="text-muted">Note: Please bold the main part for clarity.</small>
                </div>
                <div className="mb-3">
                  <label htmlFor="purpose" className="form-label">
                    Purpose
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    title='Your purpose for your inquire image'
                    id="purpose"
                    name="purpose"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.purpose}
                  />
                  {
                    formik.errors.purpose && formik.touched.purpose && (
                      <p className='text-danger mb-0'>{formik.errors.purpose}</p>
                    )
                  }
                </div>

                <button type="submit" className="shadow-none btn btn-primary w-100 mt-3">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Inquiry;
