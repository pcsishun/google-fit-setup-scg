const express =require("express");
const cors = require("cors");
const axios = require("axios");
const {google} = require("googleapis");
const urlParse = require("url-parse");
const queryParse = require('query-string');


const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

const port = 8085;

app.get("/testingfit", async (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        "817348506088-l68q11t2r373vohlq2sr1jsj2n210ilf.apps.googleusercontent.com",
        "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",
        "http://localhost:8085/stepnext"
    );

    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read", "https://www.googleapis.com/auth/fitness.location.read", "https://www.googleapis.com/auth/fitness.body.read"];
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope:scopes,
        state:JSON.stringify({
            callbackUrl: req.body.callbackUrl,
            userID:req.body.userid
        })
    });
    res.send(url)
});

app.get("/stepnext", async (req, res) => {
    const queryUrl = new urlParse(req.url);
    const code = queryParse.parse(queryUrl.query).code;

    const oauth2Client = new google.auth.OAuth2(
        "817348506088-l68q11t2r373vohlq2sr1jsj2n210ilf.apps.googleusercontent.com",
        "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",
        "http://localhost:8085/stepnext"
    );
    // console.log("code ===> ",code);
    // res.send(code);

    const tokens = await oauth2Client.getToken(code);
    // console.log("user access token ==> ",tokens);

    try{

        const headerConfig = {
            headers:{

                authorization:"Bearer " + tokens.tokens.access_token
            }
        }
        // 
        const payload = {
            aggregateBy:[
                {
                    dataTypeName:"com.google.step_count.delta",
                    dataSourceId:"derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                }
            ],
            // bucketByTime:{durationMillis: 86400000},
            // startTimeMillis:1585785599000,
            // endTimeMillis:1585958399000
        }
        const result = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payload,
            headerConfig
            );
        console.log("none err ===>",result.data);
        res.send(result.data);
    }catch(err){
        console.log("err ===> ",err);
        res.send(err);
    }
});


app.listen(port, () => {
    console.log(`google fit api listen at port ${port} ==> http://localhost:${port}`);
});




