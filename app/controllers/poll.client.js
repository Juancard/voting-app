'use strict';

(function () {
  let apiUrl = appUrl + "/api/polls/"

  let h1Title = document.getElementById('pollTitle');
  let formNewVote = document.querySelector('form');
  let hiddenInputPollId = document.getElementById('pollId');
  let selectPollOptions = document.getElementById('selectPollOptions');
  let opAddCustomOption = createOption("Add another option", "add");
  let groupCustomOption = document.getElementById("groupCustomOption");
  let inputCustomOption = document.getElementsByName('customOption')[0];

  let chartContext = document.getElementById("myChart").getContext("2d");
  let myChart;

  let isValidPollOption = (pollOption) => {
    if (!pollOption) {
      alert("Error: Poll option can not be empty");
      return false;
    } else return true;
  }

  let sendVote = (pollId, pollOption) => {
    let vote = {
      pollId,
      option: pollOption
    }
    let callback = (data) => {
      data = JSON.parse(data);
      if (data.error) alert(data.message);
      myChart.data.datasets[0].data = data.poll.options.reduce((newVotes, oldData) => {
        newVotes.push(oldData.votes);
        return newVotes;
      }, []);
      myChart.update();
    }
    ajaxFunctions.ajaxRequest("POST", apiUrl + pollId, vote, callback);
  }

  let onSubmitVote = (event) => {
    event.preventDefault(); // por default manda form derecho al server el muy negro
    let selectedOp = getSelectedOption(selectPollOptions);
    let pollOption;
    if (isSameOption(selectedOp, opAddCustomOption)){
      pollOption = inputCustomOption.value;
    } else {
      pollOption = selectedOp.value;
    }
    if (isValidPollOption(pollOption)) {
      sendVote(hiddenInputPollId.value, pollOption);
    }
  }

  formNewVote.addEventListener("submit", onSubmitVote);

  selectPollOptions.addEventListener("change", function(event){
    let selectedOp = getSelectedOption(selectPollOptions);
    if (isSameOption(selectedOp, opAddCustomOption)){
      if (groupCustomOption.style.display === "none"){
        groupCustomOption.style.display = ""; // show
        inputCustomOption.required = true;
      }
    } else if (groupCustomOption.style.display === ""){
        groupCustomOption.style.display = "none"; // hide
        inputCustomOption.required = false;
    }
  });

  var loadSelectOptions = pollOptions => {
      // poll options
      pollOptions.forEach(
        o => selectPollOptions.appendChild(createOption(o.displayName, o._id))
      );
      // user's custom option
      selectPollOptions.appendChild(opAddCustomOption);
  }


  var makeChart = pollOptions => {
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
    return new Chart(chartContext, {
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
  }

  var loadData = (data) => {
    data = JSON.parse(data);

    // Load poll title
    updateHtmlElement(data.poll, h1Title, "title");

    // Load select element with poll options
    loadSelectOptions(data.poll.options);

    // Load chart using Chart.js
    myChart = makeChart(data.poll.options);
  }

  ajaxFunctions.ready(function(){
    let url = apiUrl  + hiddenInputPollId.value;
    ajaxFunctions.ajaxRequest("GET", url, false, loadData);
  });


  ///////////////////////////////////////////
  ////////////// HELPER CLASSES /////////////
  ///////////////////////////////////////////

  function updateHtmlElement(data, element, property){
      element.innerHTML = data[property];
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function createOption(text, value){
    var x = document.createElement("OPTION");
    x.setAttribute("value", value);
    var t = document.createTextNode(text);
    x.appendChild(t);
    return x;
  }

  function getSelectedOption(selectElement){
    let selectedIndex = selectElement.selectedIndex;
    return selectElement.options[selectedIndex];
  }

  function isSameOption(op1, op2){
    return op1.value == op2.value;
  }
})();
