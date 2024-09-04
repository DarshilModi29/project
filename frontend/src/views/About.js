import React from 'react';

export default function About() {
  return (
    <>
      <div className="container-fluid products-2">
        <div className="row justify-content-md-center">
          <div className="col-md-10 col-sm-12">
            <div className="row">
              <div className="col-xl-12 col-md-10 col-sm-12">
                <p>
                  Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Nulla quis lorem ut libero malesuada feugiat. Pellentesque in ipsum id orci porta dapibus. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                  <br /><br />
                  Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container additional">
        <div className="row">
          <div className="col-xl-4">
            <img src="img/photo-12.jpg" className="img-fluid" alt="" />
          </div>
          <div className="col-xl-4">
            <img src="img/photo-13.jpg" className="img-fluid" alt="" />
          </div>
          <div className="col-xl-4">
            <img src="img/photo-14.jpg" className="img-fluid" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}

