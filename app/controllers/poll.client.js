'use strict';

(function () {
  let apiUrl = appUrl + "/api/polls";
  let apiAddVote = apiUrl + "/add/vote";

  let h1Title = document.getElementById('pollTitle');
  let formNewVote = document.querySelector('form');
  let hiddenInputPollId = document.getElementById('pollId');
  let selectPollOptions = document.getElementById('selectPollOptions');
  let opAddCustomOption = createOption("Add another option", "add");
  let groupCustomOption = document.getElementById("groupCustomOption");
  let inputCustomOption = document.getElementsByName('customOption')[0];

  let chartContext = document.getElementById("myChart").getContext("2d");
  let myChart = commonChart.getEmptyChart(chartContext, 'doughnut');

  ajaxFunctions.ready(function(){
    let url = apiUrl + "/" + hiddenInputPollId.value;
    ajaxFunctions.ajaxRequest("GET", url, false, loadData);
  });

  let loadData = (data) => {
    data = JSON.parse(data);

    if (data.error) {
      alert(data.message);
      console.error(error);
    } else if (data.message) {
      alert(data.message);
    }

    // Load poll title
    updateHtmlElement(data.poll, h1Title, "title");

    // Load select element with poll options
    loadSelectOptions(data.poll.options);

    // Load pie chart with data from server
    loadChart(myChart, data.poll.options);
  }

  function loadSelectOptions(pollOptions){
      // clear select
      selectPollOptions.innerHTML = '';

      // poll options
      pollOptions.forEach(
        o => selectPollOptions.appendChild(createOption(o.displayName, o.displayName))
      );
      // user's custom option
      selectPollOptions.appendChild(opAddCustomOption);
  }

  function loadChart(chart, options){
    let chartLabels = options.reduce((newLabels, oldData) => {
      newLabels.push(oldData.displayName);
      return newLabels;
    }, []);

    let chartValues = options.reduce((newVotes, oldData) => {
      newVotes.push(oldData.votes);
      return newVotes;
    }, []);

    commonChart.addData(chart, chartLabels, chartValues);
  }

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
    ajaxFunctions.ajaxRequest("POST", apiAddVote, vote, loadData);
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
