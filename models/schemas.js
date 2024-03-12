const mongoose =  require('mongoose')
const Schema = mongoose.Schema

const accountSchema = new Schema({
    puuid:{type:String, require: true},
    name: {type:String, require: true},
    tagline: {type:String, require: true}
})

const summonerSchema = new Schema({
    id:{type:String, require: true},
    accountId:{type:String, require: true},
    puuid:{type:String, require: true},
    name:{type:String, require: true},
    profileIconId:{type:Number, require: true},
    revisionDate:{type:Number, require: true},
    summonerLevel:{type:Number, require: true},
})

const championMasterySchema = new Schema({
    puuid:{type:String, require: true},
    championId: {type:Number, require: true},
    championLevel: {type:Number, require: true},
    championPoints: {type:Number, require: true},
    lastPlayTime: {type:Number, require: true},
    championPointsSinceLastLevel: {type:Number, require: true},
    championPointsUntilNextLevel:{type:Number, require: true},
    chestGranted: {type:Boolean, require: true},
    tokensEarned: {type:Number, require: true}, 
    summonerId: {type:String, require: true}
})

const Summoners = mongoose.model('Summoners', summonerSchema, 'summoners')
const ChampionMastery = mongoose.model('ChampionMastery', championMasterySchema, 'champion_mastery')
const Account = mongoose.model('Account', accountSchema, 'accounts')
const mySchemas = {'Summoners':Summoners, 'ChampionMastery':ChampionMastery, 'Account':Account}
module.exports = mySchemas