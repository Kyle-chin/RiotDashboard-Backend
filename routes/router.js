const express = require('express');
const router = express.Router();
const axios = require('axios');
const schemas = require('../models/schemas');

const RIOT_API_KEY = "RGAPI-38d4ba0a-03fc-4071-920a-7c6dda739c0f";

const ep = {
    na1: "https://na1.api.riotgames.com",
    apiKey: "?api_key=",
    summonerByName: "/lol/summoner/v4/summoners/by-name/",
    championMasteryV4: "/lol/champion-mastery/v4/champion-masteries/by-puuid/",
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

router.post('/updatePlayer', async(req, res) =>{
    const {id, accountId, puuid, name, profileIconId, revisionDate, summonerLevel} = req.body;

    const summonerData = {id: id, accountId: accountId, puuid: puuid, name: name, profileIconId: profileIconId, revisionDate: revisionDate, summonerLevel: summonerLevel}
    const newSummoner = new schemas.Summoners(summonerData)
    const saveSummoner = await newSummoner.save();
    if(saveSummoner){
        res.send('Summoner has been saved!');
    }else{
        res.send('Summoner was not saved.');
    }
    res.end();
});

router.get('/getPlayerGeneral', async (req, res) => {
    const playerName = req.query.username;
    const playerGeneralData = await getPlayerPUUID(playerName, "all");

    res.json(playerGeneralData);
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
    //puuid
    const PUUID = await getPlayerPUUID(playerName, "puuidOnly");
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
})

module.exports = router
