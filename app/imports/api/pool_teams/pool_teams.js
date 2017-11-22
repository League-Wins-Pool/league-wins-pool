import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Pools } from '../pools/pools';
import { Seasons } from '../seasons/seasons';
import SeasonFinder from '../seasons/finder';

export const PoolTeams = new Mongo.Collection('pool_teams');

PoolTeams.schema = new SimpleSchema({
  leagueId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (this.isInsert) {
        return Pools.findOne(this.field('poolId').value).leagueId;
      }
    },
  },
  seasonId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (this.isInsert && ! this.isSet) {
        // select latest season for league
        const leagueIdField = this.field('leagueId');
        if (leagueIdField.isSet) {
          const leagueId = leagueIdField.value;
          const latestSeason = SeasonFinder.getLatestByLeagueId(leagueId);
          if (latestSeason) return latestSeason._id;
          throw new Error(`No season found for leagueId ${leagueId}`);
        }
        this.unset();
      }
    },
  },
  seasonYear: {
    type: Number,
    autoValue() {
      if (this.isInsert && ! this.isSet) {
        const seasonIdField = this.field('seasonId');
        if (seasonIdField.isSet) {
          const seasonId = seasonIdField.value;
          const season = Seasons.findOne(seasonId);
          if (season) return season.year;
          throw new Error(`No season found for seasonId ${seasonId}`);
        }
      }
    },
  },
  poolId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  userTeamName: {
    label: 'Team name',
    type: String,
  },
  teamSummary: {
    type: String,
    defaultValue: '',
  },
  totalWins: {
    type: Number,
    defaultValue: 0,
  },
  totalLosses: {
    type: Number,
    defaultValue: 0,
  },
  totalGames: {
    type: Number,
    defaultValue: 0,
  },
  totalPlusMinus: {
    type: Number,
    defaultValue: 0,
  },
  currentRanking: {
    type: Number,
    optional: true, // there's no ranking at the start of the season
  },
  undefeatedWeeks: { // only for NFL
    type: Number,
    optional: true,
    defaultValue: 0,
  },
  defeatedWeeks: { // only for NFL
    type: Number,
    optional: true,
    defaultValue: 0,
  },
  closeWins: {
    type: Number,
    defaultValue: 0,
  },
  closeLosses: {
    type: Number,
    defaultValue: 0,
  },
  createdAt: {
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();  // Prevent user from supplying their own value
    },
  },
  updatedAt: {
    // Force value to be current date (on server) upon update
    // and don't allow it to be set upon insert.
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
});
PoolTeams.attachSchema(PoolTeams.schema);

PoolTeams.helpers({
  friendlyTeamName() {
    if (this.currentRanking) {
      return `(${this.currentRanking}) ${this.userTeamName}`;
    }
    return this.userTeamName;
  },
});

PoolTeams.formSchema = new SimpleSchema({
  poolId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  userTeamName: {
    label: 'Team name',
    type: String,
  },
  userEmail: {
    label: 'Email',
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
});


/* Access control */
if (Meteor.isServer) {
  PoolTeams.allow({
    insert(userId, doc) { return Meteor.isAppTest; },

    update(userId, doc, fieldNames, modifier) {
      // verify userId either owns PoolTeam or is commissioner of pool
      const poolId = doc.poolId;
      const pool = Pools.findOne(poolId);
      return (userId === doc.userId ||
        userId === pool.commissionerUserId);
    },

    remove(userId, doc) {
      // verify userId either owns PoolTeam or is commissioner of pool
      const poolId = doc.poolId;
      const pool = Pools.findOne(poolId);
      return (userId === doc.userId ||
      userId === pool.commissionerUserId);
    },
  });
}
