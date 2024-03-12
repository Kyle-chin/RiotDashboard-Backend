const express = require('express');
const router = express.Router();
const axios = require('axios');
const schemas = require('../models/schemas');
const { Schema } = require('mongoose');

const RIOT_API_KEY = "RGAPI-6593c295-dd60-476f-9149-6948a5aa37c6";

const ep = {
    na1: "https://na1.api.riotgames.com",
    apiKey: "?api_key=",
    summonerByName: "/lol/summoner/v4/summoners/by-name/",
    championMasteryV4: "/lol/champion-mastery/v4/champion-masteries/by-puuid/",
    americas: "https://americas.api.riotgames.com",
    accountByNameAndTag: "/riot/account/v1/accounts/by-riot-id/",
}

function getPlayerPUUID(playerName, type){
    return axios.get(ep.na1 + ep.summonerByName + playerName + ep.apiKey + RIOT_API_KEY)
    .then(response => {
        switch (type){
            case 'all':
                return response.data;
                break;
            case 'puuidOnly':
                return response.data.puuid;
                break;
            default:
                console.log("No Player Data.");
                break;
        }
    }).catch(err => err)
}
function getPlayerAccountInfo(playerName, playerTag){
    return axios.get(ep.americas + ep.accountByNameAndTag + playerName + "/" + playerTag + ep.apiKey + RIOT_API_KEY)
    .then(response => {
        return response.data;
    }).catch(error => console.log(error));
}
// figure out how to update mongodb collection with documents that don't overlap -> but insert if they do not exist
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
    const newSummoner = new schemas.Summoners(summonerData)
    const saveSummoner = await newSummoner.updateOne({ "name" : summonerData.name },{}, {upsert: true})
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
    const newAccountInfo = new schemas.Account(accountInfo)
    const saveAccountInfo = await newAccountInfo.update({ "name" : accountInfo.gameName }, {}, {upsert: true})
    if(saveAccountInfo){
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
    console.log(playerInfo);
    res.json(playerInfo);
})

router.get('/getPlayerGeneral', async (req, res) => {
    const playerName = req.query.username;
    if(playerName != undefined){
        const playerGeneralData = await getPlayerPUUID(playerName, "all");
        console.log(playerGeneralData);
        res.json(playerGeneralData);
    }
})

router.post('/updateSummonerChampionMasteries', async(req, res) => {
    const {puuid, championId, championLevel, championPoints, lastPlayTime, championPointsSinceLastLevel, championPointsUntilNextLevel, chestGranted, tokensEarned, summonerId} = req.body;

    const championMasteryData = {puuid: puuid, championId: championId, championLevel: championLevel, championPoints: championPoints, lastPlayTime: lastPlayTime, championPointsSinceLastLevel: championPointsSinceLastLevel, championPointsUntilNextLevel: championPointsUntilNextLevel, chestGranted: chestGranted, tokensEarned: tokensEarned, summonerId: summonerId}
    const newChampionMastery = new schemas.ChampionMastery(championMasteryData)
    const saveChampionMastery = await newChampionMastery.save();
    if(saveChampionMastery){
        res.send("Summoner's champion Mastery has been saved!");
    }else{
        res.send("Summoner's champion Mastery was not saved.");
    }
    res.end();
})

router.get('/allChampionMastery', async (req, res) => {
    const playerName = req.query.username;
    if(playerName != undefined){
        console.log(playerName);
        //puuid
        const PUUID = await getPlayerPUUID(playerName, "puuidOnly");
        console.log(PUUID);
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
