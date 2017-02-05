'use strict';

(function () {

   let form = document.querySelector('form');
   let btnSubmitForm = document.getElementById("btnMakePoll");
   let inputPollTitle = document.getElementsByName('title')[0];
   let textAreaPollOptions = document.getElementsByName('options')[0];

   let urlAddPoll = appUrl + "/polls/newpoll";
   let urlShowNewPoll = appUrl + "/polls" // Id added dynamically

   let isValidPollTitle = (title) => {
     if (!title) {
       alert("Error: Poll title can not be empty");
       return false;
     } else return true;
   }

   let areValidPollOptions = (options) => {
     if (!options){
       alert("Error: Poll options can not be empty");
       return false;
     } else if (options.length < 2) {
       alert("Error: Poll has to have at least two options");
       return false;
     } else return true
   }

   let sendPoll = (pollTitle, pollOptions) => {
     btnSubmitForm.disabled = true;

     let afterPollSent = (response) => {
       btnSubmitForm.disabled = false;
       let data = JSON.parse(response);
       if (data.error) {
         alert(data.message);
       } else {
         if (data.message) alert(data.message);
         if (data.redirect) window.location.href = data.redirect;
       }
     }

     let data = {
       title: pollTitle,
       options: pollOptions
     }

     ajaxFunctions.ajaxRequest("POST", urlAddPoll, data, afterPollSent);
   }

   let onSubmitPoll = (event) => {
     event.preventDefault(); // por default manda form derecho al server el muy negro
     let pollTitle = inputPollTitle.value;
     let pollOptions = getPollOptions();
     if (isValidPollTitle(pollTitle) && areValidPollOptions(pollOptions)) {
       console.log("se manda", pollTitle, pollOptions);
       sendPoll(pollTitle, pollOptions);
     }
   }

   form.addEventListener("submit", onSubmitPoll);

   function getPollOptions(){
     let pollOptionElements = document.getElementsByClassName("input-with-option");
     let options = [];
     for (let i=0; i<pollOptionElements.length; i++){
       options.push(pollOptionElements[i].value);
     }
     return options.filter(o => o != "");
   }

   ajaxFunctions.ready(function() {
     //nothing yet
   });
})();
