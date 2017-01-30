'use strict';

(function () {
  let h1Title = document.getElementById('pollTitle');
  let hiddenInputPollId = document.getElementById('pollId');
  let selectPollOptions = document.getElementById('selectPollOptions');
  let chartContext = document.getElementById("myChart").getContext("2d");

  function updateHtmlElement(data, element, property){
      element.innerHTML = data[property];
  }

  function createOption(text, value){
    var x = document.createElement("OPTION");
    x.setAttribute("value", value);
    var t = document.createTextNode(text);
    x.appendChild(t);
    return x;
  }

  var loadSelectOptions = pollOptions => pollOptions.forEach(
    o => selectPollOptions.appendChild(
      createOption(o.displayName, o._id)
    )
  );

  var loadChart = pollOptions => {
    let chartColors = [
      'rgb(255, 99, 132)',
    	'rgb(255, 205, 86)',
    	'rgb(75, 192, 192)',
    	'rgb(54, 162, 235)',
    	'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
      'rgb(231,233,237)'
    ]

    let labels = [];
    let votes = [];
    let colors = [];
    for (let i = 0; i < pollOptions.length; i++){
      labels[i] = pollOptions[i].displayName;
      votes[i] = pollOptions[i].votes;
      colors[i] = chartColors[i] || getRandomColor();
    }
    /*
    var myPieChart = new Chart(chartContext, {
        type: 'pie',
        data: chartData,
        //options: options
    });
    */
    let myChart = new Chart(chartContext, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [
            {
                data: votes,
                backgroundColor: colors,
                hoverBackgroundColor: colors,
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
    });

    function getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  }

  var loadData = (data) => {
    let poll = JSON.parse(data);

    // Load poll title
    updateHtmlElement(poll, h1Title, "title");

    // Load select element with poll options
    loadSelectOptions(poll.options);

    // Load chart using Chart.js
    loadChart(poll.options);
  }
  ajaxFunctions.ready(function(){
    var apiUrl = appUrl + "/api/polls/" + hiddenInputPollId.value;
    ajaxFunctions.ajaxRequest("GET", apiUrl, false, loadData);
  });
})();
