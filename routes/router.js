const express = require('express');
const router = express.Router();
const axios = require('axios');
const schemas = require('../models/schemas');
const { Schema } = require('mongoose');

const RIOT_API_KEY = "RGAPI-d67c26ec-9d98-49e9-8155-f154bfec778f";

const ep = {
    na1: "https://na1.api.riotgames.com",
    apiKey: "?api_key=",
    summonerByName: "/lol/summoner/v4/summoners/by-name/",
    championMasteryV4: "/lol/champion-mastery/v4/champion-masteries/by-puuid/",
    americas: "https://americas.api.riotgames.com",
    accountByNameAndTag: "/riot/account/v1/accounts/by-riot-id/",
    byPUUID: "/lol/summoner/v4/summoners/by-puuid/"
}


function getPlayerAccountInfo(playerName, playerTag){
    return axios.get(ep.americas + ep.accountByNameAndTag + playerName + "/" + playerTag + ep.apiKey + RIOT_API_KEY)
    .then(response => {
        return response.data;
    }).catch(error => console.log(error));
}
function getPlayerByPUUID(puuid){
    return axios.get(ep.na1 + ep.byPUUID + puuid + ep.apiKey + RIOT_API_KEY)
    .then(response => {
        return response.data;
    }).catch(error => console.log(error));
}
router.post('/updatePlayer', async(req, res) =>{
    const summonerData = {
        id: id,
        accountId: accountId,
        puuid: puuid,
        name: name,
        profileIconId: profileIconId,
        revisionDate: revisionDate,
        summonerLevel: summonerLevel
      } = req.body
    console.log(summonerData);
    const saveSummoner = await schemas.Summoners.updateOne({ "name" : summonerData.name },{}, {upsert: true})
    if(saveSummoner){
        res.send('Summoner has been saved!');
    }else{
        res.send('Summoner was not saved.');
    }
    res.end();
});

router.post('/updateAccount', async(req, res) =>{
    const accountInfo = {
        puuid: puuid,
        gameName: gameName,
        tagLine: tagLine
    } = req.body
    console.log(accountInfo);
    //looks to work as intended
    const saveAccountInfo = await schemas.Account.updateOne({ "gameName" : accountInfo.gameName }, { $set: {"puuid": accountInfo.puuid, "gameName": accountInfo.gamename, "tagLine": accountInfo.tagLine} }, {upsert: true})
    if(saveAccountInfo){
        console.log(saveAccountInfo);
        res.send('Account has been saved!');
    }else{
        res.send('Account was not saved.');
    }
    res.end();
})
// get player puuid by Summoner Name and tag
router.get('/getAccount', async (req, res) =>{
    const tags = req.query.player; // takes params from front-end
    const splitTags = tags.split("/"); // splits string from 'name/tag' -> [name, tag]
    const gameName = splitTags[0]; // takes name from array
    const tagLine = splitTags[1]; // takes tag from array
    
    const playerInfo = await getPlayerAccountInfo(gameName, tagLine);
    res.json(playerInfo);
})
// change to use puuid from get player account
router.get('/getPlayerGeneral', async (req, res) => {
    const tags = req.query.player; // takes params from front-end
    const splitTags = tags.split("/"); // splits string from 'name/tag' -> [name, tag]
    const gameName = splitTags[0]; // takes name from array
    const tagLine = splitTags[1]; // takes tag from array
    
    const playerInfo = await getPlayerAccountInfo(gameName, tagLine);
    
    const playerGeneralData = await getPlayerByPUUID(playerInfo.puuid);
    res.json(playerGeneralData);
})
// make a check to not duplicate, need to make a check to update the record instead of making a new one
router.post('/updateSummonerChampionMasteries', async(req, res) => {
    var index = 0;
    const playerChampMastery = { 
        gameName: gameName,
        champMastery: champMastery
    } = req.body
    for(index; index<playerChampMastery.champMastery.length; index++){
        const saveChampionMastery = await schemas.PlayerChampMastery.updateOne({ "gameName" : playerChampMastery.gameName }, { $set: {"gameName": playerChampMastery.gameName }, $push: {"champMastery": [playerChampMastery.champMastery[index]]}}, {upsert: true});
    }
})

router.get('/allChampionMastery', async (req, res) => {
    const tags = req.query.player; // takes params from front-end
    const splitTags = tags.split("/"); // splits string from 'name/tag' -> [name, tag]
    const gameName = splitTags[0]; // takes name from array
    const tagLine = splitTags[1]; // takes tag from array
    
    const playerInfo = await getPlayerAccountInfo(gameName, tagLine);
    if(playerInfo != undefined){
        
        //puuid
        const PUUID = playerInfo.puuid;
        const API_CALL = ep.na1 + ep.championMasteryV4 + PUUID + ep.apiKey + RIOT_API_KEY;

        // get API_CALL
        // gives a list of champion mastery from highest to lowest

        const ChampMastery = await axios.get(API_CALL)
            .then(response => response.data)
            .catch(err => err)

        // list of champ mastery objects
        
        var championMasteryArray = [];
        for(var i =0; i < ChampMastery.length; i++){
            championMasteryArray.push(ChampMastery[i]);
        }
        res.json(championMasteryArray);
    }
})

module.exports = router
