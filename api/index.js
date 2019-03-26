var app = require('express')();
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');
var axios = require('axios');

app.use(bodyParser.json({type: 'application/json'}));

app.use(cors());

function fileToJson(path) {
    return JSON.parse(fs.readFileSync(path));
}
function jsonToFile(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, undefined, 2));
}
app.use((req, res, next) => {
    res.apiError = function(error) {
        res.json({ success: false, error: error })
    }
    next();
})



app.get('/event', (req, res) => {
    var table = fileToJson('data.json');
    var rules = table.rules;
    var count = 0;
    for(var i = 0; i < rules.length; i++) {
        if(rules[i].trigger.device == req.query.device && rules[i].trigger.code == req.query.code) {
            count++;
            if(rules[i].action.type == "request") {
                axios.get(rules[i].action.parameters[0])
                .then(() => {})
                .catch(console.log);
            } else {
                res.apiError('Action not found');
                return;
            }
        }
    }
    res.json({ success: true, message: "Executed " + count + " Rules" })
})



app.listen(3000, () => {
    console.log('API Server Running');
})