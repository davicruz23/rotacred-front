import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

interface Props {
  data: {
    PENDENTE: number;
    RECUSADA: number;
    APROVADA: number;
  };
}

const SessionsByDeviceChart = ({ data }: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const total = data.PENDENTE + data.RECUSADA + data.APROVADA;
    const percentuais = total
      ? [
          (data.APROVADA / total) * 100,
          (data.PENDENTE / total) * 100,
          (data.RECUSADA / total) * 100,
        ]
      : [0, 0, 0];

    const chartOptions = {
      chart: {
        height: 250,
        type: "radialBar",
        fontFamily: "Poppins, sans-serif",
        animations: {
          enabled: true,
          easing: "easeInOut",
          speed: 1000,
        },
        sparkline: { enabled: true },
        dropShadow: { enabled: false },
      },
      legend: { show: false },
      plotOptions: {
        radialBar: {
          inverseOrder: false,
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 2,
            size: "40%",
            background: "transparent",
          },
          track: {
            show: true,
            background: "#F2F3F9",
            strokeWidth: "100%",
            opacity: 1,
            margin: 10,
          },
          dataLabels: {
            show: true,
            name: { show: true, fontSize: "14px", fontWeight: 500 },
            value: {
              show: true,
              fontSize: "13px",
              fontWeight: 400,
              formatter: (val: any) => {
                const number = Number(val);
                return isNaN(number) ? "0%" : `${number.toFixed(0)}%`;
              },
            },
          },
        },
      },
      colors: ["#20C997", "#FF7049", "#845ADF"],
      series: percentuais,
      labels: ["Pendente", "Recusada", "Aprovada"],
      responsive: [
        {
          breakpoint: 576,
          options: {
            chart: { height: 200 },
            legend: {
              position: "bottom",
              horizontalAlign: "center",
            },
          },
        },
      ],
    };

    const chart = new ApexCharts(chartRef.current, chartOptions);
    chart.render();

    return () => chart.destroy();
  }, [data]);

  return <div id="SessionsByDevice" ref={chartRef}></div>;
};

export default SessionsByDeviceChart;
