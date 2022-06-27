require('dotenv').config();
require('./connection/connection').connect();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { google } = require("googleapis");
const urlParse = require("url-parse");
const queryParse = require('query-string');
const request = require('request');

// import database //
const UserProfileStatus = require("./model/userProfileStatus");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const port = 8085;

let globalFirstname; 
let globalLastname;
let globalEmail;
let globalPhone; 

app.post("/testingfit", (req, res) => {
    const {firstname ,lastname, email, phone} = req.body;
    const oauth2Client = new google.auth.OAuth2(
        "817348506088-l68q11t2r373vohlq2sr1jsj2n210ilf.apps.googleusercontent.com",
        "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",
        "http://localhost:8085/stepnext",
        // "http://localhost:8085/stepblood"
        // "https://test-google-fit-dot-testdeploy-330007.as.r.appspot.com/stepnext"
    );

    // const scopes = ["https://www.googleapis.com/auth/fitness.activity.read profile email openid"];

    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.location.read",
        "https://www.googleapis.com/auth/fitness.body.read",
        "https://www.googleapis.com/auth/fitness.nutrition.read",
        "https://www.googleapis.com/auth/fitness.blood_pressure.read",
        "https://www.googleapis.com/auth/fitness.blood_glucose.read",
        "https://www.googleapis.com/auth/fitness.body_temperature.read",
        "https://www.googleapis.com/auth/fitness.reproductive_health.read",
        "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
        "https://www.googleapis.com/auth/fitness.blood_glucose.read",
        "https://www.googleapis.com/auth/fitness.sleep.read"]


    const url = oauth2Client.generateAuthUrl({
        // access_type: "offline",
        scope: scopes,
        state: JSON.stringify({
            callbackUrl: req.body.callbackUrl,
            userID: req.body.userid
        })
    });

    // const wraping = {
    //     url: url, 
    //     firstname: firstname,
    //     lastname:lastname,
    //     email:email,
    //     phone: phone
    // }
    globalFirstname = firstname;
    globalLastname = lastname; 
    globalEmail = email;
    globalPhone = phone;
    console.log("globalFirstname ==>",globalFirstname)

    request(url, (err, response, body) => {
        console.log('error: ', err);
        console.log('statusCode: ', response && response.statusCode);
        res.send({ url });
    })
});

app.get("/stepnext", async (req, res) => {
    // const query2 = new urlParse(req)
    const queryUrl = new urlParse(req.url);
 
    
    // console.log("queryUrl ===> ", queryUrl);
    console.log("globalFirstname ==>",globalFirstname);
    console.log("globalLastname ==>",globalLastname);
    console.log("globalPhone ==>",globalPhone);
    console.log("globalEmail ==>",globalEmail);

    const code = queryParse.parse(queryUrl.query).code;
    // console.log("code ==> ", code);

    const oauth2Client = new google.auth.OAuth2(
        "817348506088-l68q11t2r373vohlq2sr1jsj2n210ilf.apps.googleusercontent.com",
        "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",
        "http://localhost:8085/stepnext",
        // "http://localhost:8085/stepblood"
        // "https://test-google-fit-dot-testdeploy-330007.as.r.appspot.com/stepnext"
    );

    // console.log("oauth2Client ==> ",oauth2Client)

    const tokens = await oauth2Client.getToken(code);

    const date = new Date();

    const datePreviousMili = date.setDate(date.getDate() - 2);
    const dateNowMili = date.setDate(date.getDate());

    console.log("dateNowMili ===> ", dateNowMili);
    console.log("datePreviousMili ===>", datePreviousMili);

    try {

        const headerConfig = {
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + tokens.tokens.access_token
            }
        }

        // API getting step_count // 
        const payload = {

            aggregateBy: [
                {
                    dataTypeName: "com.google.step_count.delta",
                }
            ],
            bucketByTime: {
                durationMillis: 86400000
            },
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }

        const result = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payload,
            headerConfig
        );

        // API getting calories // 
        const payloadCalories = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.calories.expended"
                    // dataTypeName:"com.google.location.sample",
                }
            ],
            bucketByTime: {
                durationMillis: 86400000
            },
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }

        const resultCalories = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadCalories,
            headerConfig
        );

        // API get active_minutes // 
        const payloadActiveMinutes = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.active_minutes",
                    dataSourceId: "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes"
                }
            ],
            bucketByTime: {
                durationMillis: 86400000
            },
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }


        const resultActiveMinutes = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadActiveMinutes,
            headerConfig
        );

        // API get heart_minutes //
        const payloadHeartMinutes = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.heart_minutes",
                    dataSourceId: "derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes"
                }
            ],
            bucketByTime: {
                durationMillis: 86400000
            },
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }


        const resultHeartMinutes = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadHeartMinutes,
            headerConfig
        );

        // API get com.google.distance.delta // 
        const payloadDistance = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.distance.delta",
                    dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta"
                }
            ],
            bucketByTime: {
                durationMillis: 86400000
            },
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }


        const resultDistance = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadDistance,
            headerConfig
        );

        // API get com.google.heart_rate.bpm // 
        const payloadHeight = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.height",
                    dataSourceId: "derived:com.google.height:com.google.android.gms:merge_height"
                }
            ],
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }

        const resultHeight = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadHeight,
            headerConfig
        );

        // API get com.google.weight // 
        const payloadWeight = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.weight",
                    dataSourceId: "derived:com.google.weight:com.google.android.gms:merge_weight"
                }
            ],
            startTimeMillis: 1655226000000,
            endTimeMillis: 1655887372120,
        }

        const resultWeight = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadWeight,
            headerConfig
        );

        // API get com.google.sleep.segment // 
        const payloadSleep = {
            aggregateBy: [
                {
                    dataTypeName: "com.google.sleep.segment",
                    dataSourceId: "derived:com.google.sleep.segment:com.google.android.gms:merged"
                }
            ],
            activityType: 72,
            endTimeMillis: 1655887372120,
            startTimeMillis: 1654794000000
        }

        const resultSleep = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            payloadSleep,
            headerConfig
        );

        // extract data in api // 
  

        // console.log("result.data ==> ",result);
        // console.log("globalFirstname ==>",globalFirstname);
        // console.log("globalLastname ==>",globalLastname);
        // console.log("globalPhone ==>",globalPhone);
        // console.log("globalEmail ==>",globalEmail); 

        let userProfile = {
            userprofile:{
                firstname: globalFirstname,
                lastname:globalLastname,
                email:globalEmail,
                phone:globalPhone,
            },
            googleFit:[]
        }

        
        const isResultStepCount = result.data.bucket;
        const isResultCalories = resultCalories.data.bucket;
        const isResultActiveMinutes = resultActiveMinutes.data.bucket;
        const isResultHeartMinutes = resultHeartMinutes.data.bucket;
        const isResultDistance = resultDistance.data.bucket;
        const isResultHeight = resultHeight.data.bucket;
        const isResultWeight = resultWeight.data.bucket;
        const isResultSleep = resultSleep.data.bucket;

        // isResult.push(userProfile);
        // loop data and push data of step count into main result // 
        isResultStepCount.forEach(element => {
            userProfile.googleFit.push(element)
        })

        // loop data and push data of calories into main result // 
        isResultCalories.forEach(element => {
            userProfile.googleFit.push(element)
        });

        // loop data and push data of sleep into main result // 
        isResultActiveMinutes.forEach(element => {
            userProfile.googleFit.push(element)
        });

        // loop data and push data of heart minutes into main result // 
        isResultHeartMinutes.forEach(element => {
            userProfile.googleFit.push(element)
        });

        // loop data and push data of distance into main result // 
        isResultDistance.forEach(element => {
            userProfile.googleFit.push(element)
        });

        // loop data and push data of height into main result //
        isResultHeight.forEach(element => {
            userProfile.googleFit.push(element)
        });

        // loop data and push data of weight into main result //
        isResultWeight.forEach(element => {
            userProfile.googleFit.push(element)
        });

        // loop data and push data of Sleep into main result // 
        isResultSleep.forEach(element => {
            userProfile.googleFit.push(element)
        });

        try{
            await UserProfileStatus.create(userProfile);
            res.send(`<h2 style="text-align: center; margin-top:30%;">Success sync data. <a href="http://localhost:3000">back to homepage</a></h2>`);
        }catch(err){
            console.log("err collect data ==>",err);
            res.send("Fail sync data to database.", err);
        }
    } catch (err) {
        // if(err.response.data){
        //     console.log("err data  ===> ",err.response.data);
        //     console.log("err status  ===> ",err.response.status);
        //     console.log("err headers  ===> ",err.response.headers);
        //     res.send(err);
        // }else{
        //     res.send(err); 
        // }  
        // console.log("err data  ===> ", err.response.data);
        // console.log("err status  ===> ", err.response.status);
        // console.log("err headers  ===> ", err.response.headers);
        console.log("err API  ==>",err);
        res.send(err)
    }
});



app.listen(port, () => {
    console.log(`google fit api listen at port ${port} ==> http://localhost:${port}`);
});




