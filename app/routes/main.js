'use strict';

// main.js: — Any arbi­trary routes that can’t be grouped together
//log­i­cally in their own files.

module.exports = function (app, appEnv) {

  app.route('/')
      .get(function (req, res) {
        let out = {
          user: req.user,
          polls: [{
            id: "dsfas",
            title: "poll1"
          },
          {
            id: "adsfs34sd",
            title: "poll2"
          }],
          pollsOwner: false
        }
        res.render(appEnv.path + '/app/views/polls.pug', out);
      });

}
