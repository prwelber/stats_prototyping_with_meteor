import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import Initiatives from '/collections/Initiatives'
import CampaignBasics from '/collections/CampaignBasics'
import { Meteor } from 'meteor/meteor'
import { apiVersion } from '/server/token/token';
const token = require('/server/token/token.js');


export function dailyUpdate(array) {

  if (array.length >= 1) {

    let counter = 0;

    /*
    * Basic premise here is that we are removing the last three days in each
    * collection of campaign day by day insights and then querying facebook for
    * only the last three days.
    */

    // format moments for querying collection
    const dateFormat = 'YYYY-MM-DD';
    const today = moment().format(dateFormat);
    const yesterday = moment().subtract(1, 'd').format(dateFormat);
    const dayBeforeYesterday = moment().subtract(2, 'd').format(dateFormat);

    const lastThreeDays = InsightsBreakdownsByDays.remove(
      {'data.date_stop':
          {$in: [today, yesterday, dayBeforeYesterday]}
      }
    );

    console.log('Daily Breakdown background func running with array length', array.length);

    const setIntervalId = Meteor.setInterval(function () {

      const dayBreakdown = InsightsBreakdownsByDays.findOne({
        'data.campaign_id': array[counter]
      });
      const campaign = CampaignBasics.findOne({'data.campaign_id': array[counter]});

      try {
        if (campaign === null) {
            counter++;
            return;
        } else if (campaign.data.platform === 'twitter') {
          counter++;
          return;
        }
      } catch (e) {
        console.log('Error in background daily updater func', e, array[counter], dayBreakdown);
        counter++;
        return;
      }


      /*
      * These if / else if statements say the following:
      * if the counter is greater than or equal to the array length, quit
      * else, run the download job
      */

      if (counter >= array.length) {
        console.log('clearInterval');
        counter++;
        Meteor.clearInterval(setIntervalId);
      } else {

        // this begins the portion of the code taken from
        // the server method

        let dailyBreakdownArray = [];
        const masterArray = [];
        let breakdown;
        let result;
        try {
          // console.log('making http request')
          result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+array[counter]+'/insights?fields=date_start,date_stop,campaign_id,campaign_name,total_actions,impressions,spend,reach,ctr,cpm,cpp,actions,cost_per_action_type,objective&time_increment=1&date_preset=last_3_days&access_token='+token.token+'', {});
        } catch(e) {
          console.log("error with HTTP call - clearInterval and stop cron job:", e);
          Meteor.clearInterval(setIntervalId);
          SyncedCron.stop();
        }

        breakdown = result;
        //breakdown is an array of objects
        dailyBreakdownArray.push(breakdown.data.data);
        while (true) {
            try {
                breakdown = HTTP.call('GET', breakdown.data.paging['next'], {});
                dailyBreakdownArray.push(breakdown.data.data);
            } catch(e) {
                break;

            }
        }

        // flattens the array so I can loop over the whole thing at once
        dailyBreakdownArray = _.flatten(dailyBreakdownArray);

        dailyBreakdownArray.forEach(el => {
          let data = {};
          for (let key in el) {
            if (key == "actions") {
              el[key].forEach(el => {
                // this check looks for a period in the key name and
                // replaces it with an underscore if found
                // this check is used two more times below
                if (/\W/g.test(el.action_type)) {
                  // console.log("before key", el.action_type)
                  el.action_type = el.action_type.replace(/\W/g, "_");
                  // console.log("after key", el.action_type)
                  data[el.action_type] = el.value;
                }
                data[el.action_type] = el.value;
              });
            } else if (key == "cost_per_action_type") {
               el[key].forEach(el => {
                if (/\W/g.test(el.action_type)) {
                  el.action_type = el.action_type.replace(/\W/g, "_");
                  data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                } else {
                  data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                }
              });
            } else {
              // this check looks for a period in the key name and
              // replaces it with an underscore
              if (/\W/g.test(key)) {
                key = key.replace(/\W/g, "_");
                data[key] = el[key];
              } else {
                data[key] = el[key]
              }
            }
          }
          data['cpm'] = mastFunc.makeMoney(data.cpm);
          data['cpp'] = mastFunc.makeMoney(data.cpp);
          data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
          data['campaign_name'] = data.campaign_name;
          data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
          data['cpc'] = mastFunc.makeMoney((data.spend / data.clicks));
          data['spend'] = mastFunc.makeMoney(data.spend);
          data['date_start'] = moment(data['date_start'], "YYYY-MM-DD").toISOString();
          masterArray.push(data);


          // Where we search initiatives looking for the one that matches
          try {
            Initiatives._ensureIndex({
              "search_text": "text"
            });
            // add check for when campaign_name is null
            if (data && data.campaign_name) {
              let inits = Initiatives.find(
                {$text: { $search: data.campaign_name}},
                {
                  fields: { // giving each document a text score
                    score: {$meta: "textScore"}
                  },
                  sort: { // sorting by highest text score
                    score: {$meta: "textScore"}
                  }
                }
              ).fetch();
              inits = inits[0];  // set "inits" equal to initiative with highest textScore
              data['initiative'] = inits.name; //assign initiative name to data object
            }
          } catch(e) {
            console.log("Error assigning Initiative to Daily Breakdown", e);
          } // end of initiative matching
        }); // end of dailyBreakdownArray.forEach

        // Insert into Mongo
        try {
          masterArray.forEach(el => {
            InsightsBreakdownsByDays.insert({
              data: el
            });
          });
        } catch(e) {
          console.log('Error inserting data into DB', e);
        }
        counter++;
      } // end of else block in if (counter >= array.length)
    // }, 10000);
    }, 30000); // end of Meteor.setInterval
  } // end if if(array)
}
