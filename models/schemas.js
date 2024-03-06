const mongoose =  require('mongoose')
const Schema = mongoose.Schema

const summonerSchema = new Schema({
    id:{type:String},
    accountId:{type:String},
    puuid:{type:String},
    name:{type:String},
    profileIconId:{type:Number},
    revisionDate:{type:Number},
    summonerLevel:{type:Number},
})

const championMasterySchema = new Schema({
    puuid:{type:String},
    championId: {type:Number},
    championLevel: {type:Number},
    championPoints: {type:Number},
    lastPlayTime: {type:Number},
    championPointsSinceLastLevel: {type:Number},
    championPointsUntilNextLevel:{type:Number},
    chestGranted: {type:Boolean},
    tokensEarned: {type:Number}, 
    summonerId: {type:String}
})

const Summoners = mongoose.model('Summoners', summonerSchema, 'summoners')
const ChampionMastery = mongoose.model('ChampionMastery', championMasterySchema, 'champion_mastery')

const mySchemas = {'Summoners':Summoners, 'ChampionMastery':ChampionMastery}
module.exports = mySchemas