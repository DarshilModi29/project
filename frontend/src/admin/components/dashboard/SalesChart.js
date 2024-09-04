import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import Chart from "react-apexcharts";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

const SalesChart = () => {

  const formattedDate = (date) => {
    const year = date.getFullYear();
    const month = ((date.getMonth()) + 1).toString().padStart(2, 0);
    const day = date.getDate().toString().padStart(2, 0);
    return `${day}-${month}-${year}`;
  }

  const [chartOptions, setChartOptions] = useState({
    series: [{
      name: "Images Uploaded",
      data: []
    }],
    options: {
      chart: {
        type: 'bar',
      },
      xaxis: {
        categories: []
      }
    }
  })

  const getChartData = useCallback(async () => {
    const response = await fetch('http://localhost:5000/api/chartData', {
      headers: {
        "Authorization": `bearer ${Cookies.get("jwt")}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      const dates = getDates(data.start, data.end);
      const formattedData = dates.map(date => {
        const found = data.data.find(item => new Date(item._id).toDateString() === date.toDateString());
        return found ? found.count : 0
      });

      setChartOptions(prev => ({
        ...prev,
        series: [{
          name: "Images Uploaded",
          data: formattedData
        }],
        options: {
          ...prev.options,
          xaxis: {
            categories: dates.map(date => formattedDate(date))
          }
        }
      }))
    }
  }, []);

  const getDates = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    let endDate = new Date(end);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  useEffect(() => {
    getChartData();
  }, [getChartData]);

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Uploaded Images Summary</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          Weekly Uploaded Images Report
        </CardSubtitle>
        <Chart
          type="bar"
          width="100%"
          height="390"
          options={chartOptions.options}
          series={chartOptions.series}
        ></Chart>
      </CardBody>
    </Card>
  );
};

export default SalesChart;
