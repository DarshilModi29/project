import React, { useCallback, useEffect, useState } from 'react';
import config from '../admin/components/Config';
import ShowImages from '../components/ShowImages';

function Home() {

  const [mostDownloads, setMostDownloads] = useState([]);
  const [mostRated, setMostRated] = useState([]);

  const mostDownloadsImages = useCallback(async () => {
    try {
      const response = await fetch(`${config.SERVER_URL}/api/mostDownloadedImages`);
      const data = await response.json();
      if (response.ok) {
        setMostDownloads(data.data);
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert(error.toString());
      console.log(error);
    }
  }, []);

  const mostRatedImages = useCallback(async () => {
    try {
      const response = await fetch(`${config.SERVER_URL}/api/mostRatedImages`);
      const data = await response.json();
      if (response.ok) {
        setMostRated(data.data);
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert(error.toString());
      console.log(error);
    }
  }, []);

  useEffect(() => {
    mostDownloadsImages();
    mostRatedImages();
  }, [mostDownloadsImages, mostRatedImages])

  return (
    <div className="App">
      {/* Portfolio-Text */}
      <div className="container-fluid pb-5 portfolio-text">
        <div className="row">
          <div className="col-md-7 offset-md-1 col-sm-12">
            <h2>Donec rutrum congue leo eget malesuada lacinia eget consectetur.</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-7 offset-md-1 col-sm-12">
            <p className="pb-5 pt-5">
              Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vivamus magna convallis at tellus. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <h2 className="text-center mb-4">Most Downloaded Images</h2>
      <ShowImages images={mostDownloads} page="home" />
      <h2 className="text-center mb-4 mt-4">Most Rated Images</h2>
      <ShowImages images={mostRated} page="home" />
    </div>
  );
}

export default Home;
