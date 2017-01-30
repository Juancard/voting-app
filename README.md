# Voting App!

## Overview

Here are the specific user stories implemented:
- As an authenticated user, I can keep my polls and come back later to access them.
- As an authenticated user, I can share my polls with my friends.
- As an authenticated user, I can see the aggregate results of my polls.
- As an authenticated user, I can delete polls that I decide I don't want anymore.
- As an authenticated user, I can create a poll with any number of possible items.
- As an unauthenticated or authenticated user, I can see and vote on everyone's polls.
- As an unauthenticated or authenticated user, I can see the results of polls in chart form. (This could be implemented using Chart.js or Google Charts.)
- As an authenticated user, if I don't like the options on a poll, I can create a new option.

# Quick Start Guide

### Prerequisites

In order to use Voting-app, you must have the following installed:

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- [MongoDB](http://www.mongodb.org/)
- [Git](https://git-scm.com/)

### Installation & Startup

To install this app, simply enter the below in the terminal window:

```bash
$ git clone https://github.com/Juancard/voting-app your-project
```

To install the dependencies, enter the following in your terminal:

```
$ cd your-project
$ npm install
```

This will install the Voting-app components into the `your-project` directory.

### Setup Twitter Authentication

Please follow [this guide](https://themepacific.com/how-to-generate-api-key-consumer-token-access-key-for-twitter-oauth/994/) to register the application with Twitter and get API keys / secrets.

### Local Environment Variables

Create a file named `.env` in the root directory. This file should contain:

```
TWITTER_KEY=your-client-id-here
TWITTER_SECRET=your-client-secret-here
MONGO_URI=mongodb://localhost:27017/voting-app
PORT=8080
APP_URL=http://localhost:8080/
```

### Starting the App

To start the app, make sure you're in the project directory and type `node server.js` into the terminal. This will start the Node server and connect to MongoDB.

You should the following messages within the terminal window:

```
Node.js listening on port 8080...
```

Next, open your browser and enter `http://localhost:8080/`. Congrats, you're up and running!

## Features

| Features           | Voting-app|
|:---------          |:--------: |
| MongoDB            | _Yes_     |
| Express            | _Yes_     |
| Node.js            | _Yes_     |
| Passport           | _Yes_     |
| Mongoose           | _Yes_     |

## License

MIT License. [Click here for more information.](LICENSE.md)
