'use strict';

(function () {
  let apiUrl = appUrl + "/api/polls";
  let apiAddVote = apiUrl + "/votes/add";
  let apiAddOption = apiUrl + "/options/add/with/vote";

  let formNewVote = document.querySelector('form');
  let btnPollRemove = document.getElementById('btnPollRemove') || null;
  let anchorShareTwitter = document.getElementById('anchorShareTwitter');

  let hiddenInputPollId = document.getElementById('pollId');
  let selectPollOptions = document.getElementById('selectPollOptions');
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

    // Load twitter share button
    loadAnchorTwitterShare(data.poll);

    // Only Show Active options
    let activeOptions = data.poll.options.filter(o => o.state == "active");

    // Load pie chart with data from server
    loadChart(myChart, activeOptions);
  }

  function loadAnchorTwitterShare(poll) {
    let urlTwitter = "http://twitter.com/share" || "https://twitter.com/intent/tweet";
    let urlToShare = window.location.href;
    let text = poll.title;
    let toMention = "JuanCruzCardona";
    anchorShareTwitter.href = urlTwitter + "?url=" + urlToShare + "&text=" + text + "&via=" + toMention;
  }

  function loadChart(chart, options){
    let chartLabels = options.reduce((newLabels, oldData) => {
      newLabels.push(oldData.displayName);
      return newLabels;
    }, []);

    let chartValues = options.reduce((newVotes, oldData) => {
      let optionVotes = oldData.votes.filter(v => {
        return v.state == "active";
      });
      newVotes.push(optionVotes.length);
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

  let sendVote = (optionId) => {
    let vote = {
      optionId,
      pollId: hiddenInputPollId.value
    }
    let callback = (data) => {
      data = JSON.parse(data);
      if (data.error) {
        alert(data.message || "Error en servidor");
      } else{
        console.log("Vote added: ", data.pollOption);
        commonChart.updateLabelValue(myChart, data.pollOption.displayName, data.pollOption.totalVotes);
      }
    }
    ajaxFunctions.ajaxRequest("POST", apiAddVote, vote, callback);
  }

  let sendAddOptionWithVote = (optionText) => {
    let option = {
      optionText,
      pollId: hiddenInputPollId.value
    }
    let callback = (data) => {
      data = JSON.parse(data);
      if (data.error) {
        alert(data.message || "Error en servidor");
      } else {
        console.log("Option added:", data);
        commonChart.addLabelValue(myChart, data.pollOption.displayName, data.pollOption.totalVotes);
        selectPollOptions.insertBefore(createOption(data.pollOption.displayName, data.pollOption._id), selectPollOptions.lastChild);
      }
    }
    ajaxFunctions.ajaxRequest("POST", apiAddOption, option, callback);
  }

  let onSubmitVote = (event) => {
    event.preventDefault(); // por default manda form derecho al server el muy negro
    let selectedOp = getSelectedOption(selectPollOptions);
    // if option value is empty:
    if (selectedOp.value == 'add'){
      // it's 'add custom option' option
      let createdPollOption = inputCustomOption.value;
      if (isValidPollOption(createdPollOption)) {
        sendAddOptionWithVote(createdPollOption);
      }
    } else {
      let pollOptionId = selectedOp.value;
      sendVote(pollOptionId);
    }

  }

  formNewVote.addEventListener("submit", onSubmitVote);

  var onDeletePoll = () => {
    let destUrl = apiUrl + "/" + hiddenInputPollId.value;
    ajaxFunctions.ajaxRequest("DELETE", destUrl, null, (data) => {
      data = JSON.parse(data);
      if (data.error) {
        alert(data.message || "Error en servidor");
      } else {
        alert(data.message || "Operación exitosa");
        window.location.href = data.redirect || appUrl;
      }
    });
  }

  if (btnPollRemove){
    btnPollRemove.addEventListener("click", onDeletePoll);
  }

  selectPollOptions.addEventListener("change", function(event){
    let selectedOp = getSelectedOption(selectPollOptions);
    if (selectedOp.value == 'add'){
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
