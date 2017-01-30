'use strict';

(function () {

   var form = document.querySelector('form');
   var inputPollTitle = document.getElementsByName('title')[0];
   var textAreaPollOptions = document.getElementsByName('options')[0];
   var destUrl = appUrl + "/polls/newpoll"

   form.addEventListener("submit", function(event){
     event.preventDefault(); // por default manda form derecho al server el muy negro
     let pollTitle = inputPollTitle.value;
     let pollOptions = textAreaPollOptions.value;
     if (!pollTitle) {
       alert("Error: Poll title can not be empty");
     } else if (!pollOptions){
       alert("Error: Poll options can not be empty");
     } else {
       pollOptions = pollOptions.split("\n");
       if (pollOptions.length < 2) {
         alert("Error: Poll has to have at least two options");
       } else {
         let data = {
           title: pollTitle,
           options: pollOptions
         }
         ajaxFunctions.ajaxRequest("post", destUrl, data, function(response){
           let data = JSON.parse(response);
           console.log(data);
           alert("Respuesta Correcta!");
         })
       }
     }
   });

   ajaxFunctions.ready(function() {

   });
})();
