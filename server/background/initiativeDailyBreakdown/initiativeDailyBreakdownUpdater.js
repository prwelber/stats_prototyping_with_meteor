import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment'
import { dailyUpdate } from './initiativeDailyBreakdownUpdaterFunc'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import { apiVersion } from '/server/token/token'
const later = require('later');

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Daily Breakdown Updater",

  schedule: (parser) => {
    // return parser.text('at 7:30am');
    return parser.text('every 55 seconds');
  },

  job: (time) => {
    const inits = Initiatives.find({userActive: true}).fetch();

    // const active = _.filter(inits, (el) => {
    //   if (el.userActive) {
    //     return el
    //   }
    // });

    let onlyIds = _.map(inits, (el) => {
      return el.campaign_ids
    });
    // now i'm sitting with all the campaign ID's of the active initiatives

    let flat = _.flatten(onlyIds);

    dailyUpdate(flat);

  }
});
