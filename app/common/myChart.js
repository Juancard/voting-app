var commonChart = {
  chartColors: [
    'rgb(239, 222, 205)',
    'rgb(255, 159, 64)',
    "rgb(205, 149, 117)",
    'rgb(255, 99, 132)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(120, 219, 226)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(231,233,237)',
    "rgb(253, 217, 181)",
  ],
  getEmptyChart: (context, chartType) =>
    new Chart(context, {
        type: chartType,
        backgroundColor: "#F5DEB3",
        data: {
            labels: [],
            datasets: [
            {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
                borderWidth: 3
            }]
        },
        options: {
          responsive: true,
          legend: {
              position: 'bottom',
          },
          animation: {
              animateScale: true,
              animateRotate: true
          }
        }
    }),
  addData: (givenChart, labels, values) => {
    givenChart.data.datasets[0].data = values;
    givenChart.data.labels = labels;

    let colors = []
    for (let i=0; i<labels.length; i++){
      colors.push(commonChart.chartColors[i] || commonChart.getRandomColor());
    }
    givenChart.data.datasets[0].backgroundColor = colors;
    givenChart.data.datasets[0].hoverBackgroundColor = colors;

    givenChart.update();
  },
  addLabelValue: (givenChart, label, value) => {
    let dataset = givenChart.data.datasets[0];
    let allLabels = givenChart.data.labels;
    let newColor = commonChart.chartColors[allLabels.length] || commonChart.getRandomColor()
    allLabels.push(label);
    dataset.data.push(value);
    dataset.backgroundColor.push(newColor);
    dataset.hoverBackgroundColor.push(newColor);
    givenChart.update();
  },
  updateLabelValue: (givenChart, label, newValue) => {
    let i = givenChart.data.labels.indexOf(label);
    if (i != -1) {
      givenChart.data.datasets[0].data[i] = newValue;
      givenChart.update();
      return true;
    }
    return false;
  },
  getRandomColor: () => {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
};
