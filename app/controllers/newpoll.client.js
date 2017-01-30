'use strict';

(function () {

   let form = document.querySelector('form');
   let inputPollTitle = document.getElementsByName('title')[0];
   let textAreaPollOptions = document.getElementsByName('options')[0];
   let destUrl = appUrl + "/polls/newpoll";

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
     } else if (options.split("\n").length < 2) {
       alert("Error: Poll has to have at least two options");
       return false;
     } else return true
   }

   let sendPoll = (pollTitle, pollOptions) => {

     let afterPollSent = (response) => {
       let data = JSON.parse(response);
       console.log(data);
       alert("Respuesta Correcta!");
     }

     let data = {
       title: pollTitle,
       options: pollOptions
     }

     ajaxFunctions.ajaxRequest("post", destUrl, data, afterPollSent);
   }

   let onSubmitPoll = (event) => {
     event.preventDefault(); // por default manda form derecho al server el muy negro
     let pollTitle = inputPollTitle.value;
     let pollOptions = textAreaPollOptions.value;
     if (isValidPollTitle(pollTitle) && areValidPollOptions(pollOptions)) {
       sendPoll(pollTitle, pollOptions.split("\n"));
     }
   }

   form.addEventListener("submit", onSubmitPoll);

   ajaxFunctions.ready(function() {
     //nothing yet
   });
})();
