const express =require("express");
const cors = require("cors");
const axios = require("axios");
const {google} = require("googleapis");
const urlParse = require("url-parse");
const queryParse = require('query-string');
const request = require('request');
// const { response } = require("express");

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

const port = 8085;

app.get("/testingfit", (req, res) => {

    const oauth2Client = new google.auth.OAuth2(
        "817348506088-l68q11t2r373vohlq2sr1jsj2n210ilf.apps.googleusercontent.com",
        "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",
        "http://localhost:8085/stepnext"
        // "https://test-google-fit-dot-testdeploy-330007.as.r.appspot.com/stepnext"
    );

    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read profile email openid"];

    // const scopes = ["https://www.googleapis.com/auth/fitness.activity.read",
    // "https://www.googleapis.com/auth/fitness.location.read",
    // "https://www.googleapis.com/auth/fitness.body.read",
    // "https://www.googleapis.com/auth/fitness.nutrition.read",
    // "https://www.googleapis.com/auth/fitness.blood_pressure.read",
    // "https://www.googleapis.com/auth/fitness.body_temperature.read"];

    // const scopes = ["https://www.googleapis.com/auth/fitness.activity.write"];

    const url = oauth2Client.generateAuthUrl({
        // access_type: "offline",
        scope:scopes,
        state:JSON.stringify({
            callbackUrl: req.body.callbackUrl,
            userID:req.body.userid
        })
    });

    
    request(url, (err, response, body) => {
        console.log('error: ' ,err);
        console.log('statusCode: ', response && response.statusCode);
        res.send({url});
    })


});

app.get("/stepnext", async  (req, res) => {

    const queryUrl = new urlParse(req.url);
    // console.log("queryUrl ===> ", queryUrl);

    const code = queryParse.parse(queryUrl.query).code;
    // console.log("code ==> ", code);

    const oauth2Client = new google.auth.OAuth2(
        "817348506088-l68q11t2r373vohlq2sr1jsj2n210ilf.apps.googleusercontent.com",
        "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",
        "http://localhost:8085/stepnext"
        // "https://test-google-fit-dot-testdeploy-330007.as.r.appspot.com/stepnext"
    );

    // console.log("code ===> ",code);
    // res.send(code);

    const tokens = await oauth2Client.getToken(code);
    // console.log("user access token ==> ",tokens);
    try{

        const headerConfig = {
            headers:{
                "Content-Type":"application/json",
                authorization:"Bearer " + tokens.tokens.access_token
            }
        }
        // 
        const payload = {

            aggregateBy:[
                {
                    dataTypeName:"com.google.step_count.delta",
                    dataSourceId:"derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                    // dataSourceId:"derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments"
                }
            ],
            bucketByTime:{
                durationMillis: 86400000
            },
            startTimeMillis:1654621200000,
            endTimeMillis:1654863013121,
        }

        const result = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payload,
            headerConfig
            );

        const isResult = result.data.bucket;
        
        console.log(`isResult ==> ${isResult}`)
        // let arrayData = [];

        // isResult.forEach(element => {
        //     const pointData =  element.dataset; 
        //     pointData.forEach(arrayP => {
        //         // const isValue = arrayP.value;
        //         console.log(arrayP.value);
        //         // isValue.forEach(arrayV => {
        //         //     console.log(arrayV);
        //         // })
        //         if(arrayP.value === undefined){
        //             arrayData.push("not found");
        //         }else{
        //             arrayData.push(arrayP.value)
        //         }
        //     })
        // });
        res.send(isResult);

    }catch(err){
        console.log("err ===> ",err);
        res.send(err);
    }
});


app.listen(port, () => {
    console.log(`google fit api listen at port ${port} ==> http://localhost:${port}`);
});




