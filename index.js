const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const google = require("google-finance-data");
const environment = process.env;

app.use(bodyParser.json()) // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

//This is the route the API will call
function response(message, res, responseText = 'Bad Request: You should feel Bad') {
  axios.post(
    `https://api.telegram.org/bot${environment.TELEGRAM_KEY}/sendMessage`,
    {
      chat_id: message.chat.id,
      parse_mode: 'HTML',
      text: responseText
    }
  ).then(r => {
    res.end('OK')
  }).catch(err => {
    console.log('error', err)
    res.end('Error')
  });
}

app.post('/stonks', function(req, res) {
  const { message } = req.body
  if (!message || !message.text) { return res.end('OK'); }

  const user = { id: message.from.id, first_name: message.from.first_name, username: message.from.username };
  // user = {
  //   id,
  //   name,
  //   username
  // }
  const commands = message.text.split(' ');

  if (commands[0] === '/check' && commands[1]) {
    google.getSymbol(commands[1]).then((data) => {
      console.log(data);
      response(message, res, `${commands[1]}: ${data.ticker}`);
    }).catch((err) => {
      console.log(err);
      response(message, res, `Something went wrong. Is "${commands[1]}" the right ticker?`);
    })

  } else if (commands[0] === '/stonks') {
    // MEME CODE
    axios.get('https://www.reddit.com/r/stonks/hot.json').then(result => {
      if (result && result.data && result.data.data && result.data.data.children) {
        var children = result.data.data.children;
        var cleanChildren = children.filter(c => c.data.url.match(/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/));
        if (cleanChildren.length) {
          console.log('Reddit Request Success!');
          var index = Math.floor(Math.random() * cleanChildren.length);
          if (cleanChildren[index].data.over_18) {
            appResponse = 'Hey ' + user + ', this is an NSFW link: <code>' + cleanChildren[index].data.url + '</code> \n Enjoy it you perv';
          } else {
            appResponse = cleanChildren[index].data.url;
          }
        } else {
          appResponse = 'Either this subreddit doesn\'t exist or it doesn\'t have any pics';
        }
      }
      response(message, res, appResponse);
    }).catch(err => {console.log(err)});

  } else {
    response(message, res);
  }
});

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})
