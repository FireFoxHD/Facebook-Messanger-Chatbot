// Imports dependencies and set up http server
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const app = express().use(bodyParser.json()); // creates express http server
app.listen(process.env.PORT || 5000, () => console.log("webhook is listening"));

const accessToken = process.env.PAGE_ACCESS_TOKEN;

app.get('/', (req,res)=>{
  res.send('Hello from bot!')
})

app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {

    res.status(200).send("EVENT_RECEIVED");

    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];  
      let sender_psid = webhook_event.sender.id;
      return handleMessage(sender_psid, webhook_event);         
    });

  } else {
    res.sendStatus(404); // Returns a '404 Not Found' if event is not from a page subscription
  }
});

app.get("/webhook", (req, res) => {
  
  let VERIFY_TOKEN = "anything"; // Your verify token. Should be a random string.

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {// Checks if a token and mode is in the query string of the request

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);// Responds with '403 Forbidden' if verify tokens do not match
    }
  }
});


//Constructs the message to be sent to user and passes it to callSendAPI function
function handleMessage(sender_psid, webhook_event){
  //parse the webhook event (find the type of event)
  let response;

  if (webhook_event.message){
    console.log("Message Event")
    //check for attachment if none then its just a text message

    //CODE HERE

    //
    let received_message = webhook_event.message;

    const greeting = firstTrait(received_message.nlp, 'wit$greetings');
    if (greeting && greeting.confidence > 0.8) {
      response = {
        text: "Greeting Detected"
      };
    } else { 
      response = {
        text: "Dont think thats as greeting"
      };
    }
   
    
  }

  if (webhook_event.delivery){
    console.log("Delivery Event");
  }

  if (webhook_event.read){
    console.log("Read Event");
  }

  if (webhook_event.postback){
    console.log("Postback Event");
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  
  let request_body = {
    recipient :{id : sender_psid},
    message : response
  };

  const params = {
    params: {access_token: accessToken}
  }

  
  axios.post('https://graph.facebook.com/v7.0/me/messages', request_body, params,
    (err)=>{
          if (err) {
            console.log("#### ERROR ####: ", err);
          }
    }
  );
}

//===========   NLP STUFF  ========================

function firstTrait(nlp, name) {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}