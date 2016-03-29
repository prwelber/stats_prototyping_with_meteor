Meteor.methods({
  'aggregateForChart': function (initiative) {
    console.log('aggregateForChart running');
    let arr = [];
    /*
    below we are querying the daily breakdown collection for all the
    documents that have a campaign ID that is also in the initiative array.
    We are also returning only the fields we need for the charting.
    */
    initiative.campaign_ids.forEach(el => {
      let x = InsightsBreakdownsByDays.find(
        {'data.campaign_id': el},
        { fields: {
          'data.date_start': 1,
          'data.campaign_id': 1,
          'data.impressions': 1,
          'data.clicks': 1,
          'data.like': 1,
          'data.spend': 1,
          'data.campaign_name': 1,
          'data.cost_per_like': 1,
          'data.post_engagement': 1,
          'data.cost_per_post_engagement': 1,
          'data.cost_per_page_engagement': 1,
          'data.cost_per_video_view': 1,
          'data.cpc': 1,
          'data.cpm': 1,
          'data.cpp': 1,
          'data.ctr': 1,
          'data.reach': 1,
          'data.total_actions': 1,
          'data.video_view': 1,
          _id: 0
          }
        }).fetch()
      x ? arr.push(x) : '';
    });

    arr = _.flatten(arr);


    /*
    Below, we are accounting for any gaps in the timeline since not all
    campaigns run on sequential days. within the forEach we are looking for
    difference between days and if that difference is more than 1 day (< -1)
    then we loop the number of times as the difference and we use moment to add
    one on each loop, giving us the missing days
    As of this writing, we need to push those dates into the existing array
    at the appropriate position and give them all null values
    This is so that the graph will reflect accurately what happens on what days
    */

    // console.log(arr);
    let timeForm = "MM-DD-YYYY"
    let total = 0;

    console.log(arr.length)

    try {

      arr.forEach((el, index) => {
        console.log("from first arr:", arr[index].data.date_start)
          var diff = moment(arr[index].data.date_start, timeForm).diff(moment(arr[index + 1].data.date_start, timeForm), 'days');

          if (diff < -1) {
            console.log('from first arr - days diff', Math.abs(diff));
            total += Math.abs(diff) - 1;
          }
      });
    } catch(e) {
        console.log("Is it a TypeError", e instanceof TypeError);
        console.log("Error Message:", e.message);
    }

    console.log('total number of days we need to generate', total);

    try {


      for (var i = 0; i < arr.length + total; i++) {
        var diff = moment(arr[i].data.date_start, timeForm).diff(moment(arr[i + 1].data.date_start, timeForm), 'days');

        if (diff < -1) {
          for (var j = 1; j < Math.abs(diff); j++) {
            console.log("generated nums:", moment(arr[i].data.date_start, timeForm).add(j, 'd').format(timeForm));
            arr.splice(i + j, 0, {
              data: {
                date_start: moment(arr[i].data.date_start, timeForm).add(j, 'd').format(timeForm),
                impressions: null,
                clicks: null,
                like: null,
                spend: null,
                cost_per_like: null,
                cost_per_page_engagement: null,
                cost_per_post_engagement: null,
                cost_per_video_view: null,
                cpm: null,
                cpc: null,
                reach: null,
                total_actions: null,
                video_view: null,
                post_engagement: null
              }
            })
          }
        }
      }




      // arr.forEach((el, index) => {

      //   console.log(arr[index].data.date_start)
      //   var diff = moment(arr[index].data.date_start, timeForm).diff(moment(arr[index + 1].data.date_start, timeForm), 'days');
      //
      //   if (diff < -1) {
      //       for (var i = 1; i < Math.abs(diff); i++) {
      //         console.log("generated nums:", moment(arr[index].data.date_start, timeForm).add(i, 'd').format(timeForm));
      //         arr.splice(index + i, 0, {
      //           data: {
      //             date_start: "generated date " + moment(arr[index].data.date_start, timeForm).add(i, 'd').format(timeForm),
      //             impressions: null,
      //             clicks: null,
      //             like: null,
      //             spend: null,
      //             cost_per_like: null,
      //             cost_per_page_engagement: null,
      //             cost_per_post_engagement: null,
      //             cost_per_video_view: null,
      //             cpm: null,
      //             cpc: null,
      //             reach: null,
      //             total_actions: null,
      //             video_view: null,
      //             post_engagement: null

      //           }
      //         })
      //       }
      //     }
      // });
    } catch(e) {
      // statements
      console.log(e);
    }



    // arr.forEach((el,ind) => {
    //   console.log(el.data);
    // })







    arr = _.sortBy(arr, function (el){ return moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD-YYYY") });

    arr.forEach(el => {
      el.data.date_start = moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD");
    });

    // needed to account for likes being undefined so we can add to zero
    // and format data so it can be added or averaged
    arr.forEach(el => {
      el.data.impressions === null ?
      el.data.impressions = null :
      el.data.impressions = parseInt(el.data.impressions);

      el.data.spend = parseFloat(accounting.unformat(el.data.spend).toFixed(2));
      el.data.cpm = parseFloat(accounting.unformat(el.data.cpm).toFixed(2));
      el.data.cpc = parseFloat(accounting.unformat(el.data.cpc).toFixed(2));
      el.data.cost_per_like = parseFloat(accounting.unformat(el.data.cost_per_like).toFixed(2));
      el.data.cost_per_video_view = parseFloat(accounting.unformat(el.data.cost_per_video_view).toFixed(2));
      el.data.cost_per_post_engagement = parseFloat(accounting.unformat(el.data.cost_per_post_engagement).toFixed(2));
      if (el.data.like === undefined || el.data.like === NaN) {
        el.data.like = 0;
      }
    })
    /*
    In the below code block, we are saying that if the temp obj does not have
    a key that is equal to the start date of the object being iterated over,
    set a key equal to start date and then set keys and values for all the
    required values (impressions, clicks, etc..) and if there is already that
    start date key, then just add the required values onto the already existing
    values. The next if statement has it's own explainer below.
    */

    let temp = {}
    let obj = null;
    let otherArray = [];

    for (var i = 0; i < arr.length; i++) {
      obj = arr[i].data;

      if (! temp[obj.date_start]) {
        temp[obj.date_start] = obj.date_start;
        temp['impressions'] = obj.impressions;
        temp['clicks'] = obj.clicks;
        temp['spend'] = obj.spend;
        temp['like'] = obj.like || 0;
        temp['cost_per_like'] = obj.cost_per_like;
        temp['cost_per_page_engagement'] = obj.cost_per_page_engagement;
        temp['cost_per_post_engagement'] = obj.cost_per_post_engagement;
        temp['cost_per_video_view'] = obj.cost_per_video_view;
        temp['cpm'] = obj.cpm;
        temp['cpc'] = obj.cpc;
        temp['cost_per_like'] = obj.cost_per_like;
        temp['reach'] = obj.reach;
        temp['total_actions'] = obj.total_actions;
        temp['video_view'] = obj.video_view;
        temp['post_engagement'] = obj.post_engagement;
      } else {
        temp['impressions'] += obj.impressions;
        temp['clicks'] += obj.clicks;
        temp['spend'] += obj.spend;
        temp['like'] += obj.like;
        temp['reach'] += obj.reach;
        temp['total_actions'] += obj.total_actions;
        temp['video_view'] += obj.video_view;
        temp['post_engagement'] += obj.post_engagement;
        temp['cpm'] = temp.spend / (temp.impressions / 1000);
        temp['cpc'] = temp.spend / temp.clicks;
        temp['cost_per_like'] = temp.spend / temp.like;
      }
      /*
      this next if statement says essentially: if the object start date is
      not equal to the start date of the following object --> arr[i + 1], push the temp obj
      into the otherArray and reset the temp object
      */

      /*
      at the end, arr[i+1] will be undefined, so needed to account for that scenario
      */
      if (arr[i+1] === undefined || arr[i].data.date_start !== arr[i+1].data.date_start) {
        otherArray.push(temp);
        temp = {};
      }

    }


    // make sure all values are null so the charts reflect that
    otherArray.forEach(el => {
      if (el.impressions === null) {
        el.spend = null;
        el.like = null;
        el.cost_per_like = null;
        el.cost_per_post_engagement = null;
        el.cost_per_video_view = null;
        el.cpm = null;
        el.cpc = null;
      }
    });

    console.log(otherArray);

    return otherArray;

  },
  'hourlyChart': function (initiative) {
    console.log('pieChart running');
    let campaignIds = initiative.campaign_ids

    let twentyFourHourArray = [];
    var time = moment('12:00 am', 'hh:mm a');
    /*
    Here, we are aggregating from the hourlybreakdown collection. We are looking to match
    based on hour (which has been set when the hourlybreakdown comes in) and the campaign id, which we are
    matching to the array of campaign ID's from the initiative which is an argument in this function.
    we are summing spend clicks impressions and likes and then adding cost per data in the loop.
    The for loop goes until 23 because it starts at zero, not 1.
    Upon each completion of a loop, the time is incremented by one hour.
     */
    for (var i = 0; i <= 23; i++) {
      var pipeline = [
        {$match:
          {$and: [
              {'data.hour': time.format('hh:mm a')},
              {'data.campaign_id': { $in: campaignIds } }
              // {'data.campaign_id': { $in: campaignIds } }
            ]
          }
        },
        {$group: {
          _id: time.format('hh:mm a'),
          spend: {$sum: "$data.spend"},
          clicks: {$sum: "$data.clicks"},
          impressions: {$sum: "$data.impressions"},
          likes: {$sum: "$data.like"}
          }
        }
      ];
      var result = HourlyBreakdowns.aggregate(pipeline);
      result[0]['cpc'] = result[0].spend / result[0].clicks;
      result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
      if (result[0].likes === 0) {
        result[0]['cpl'] = 0;
      } else {
        result[0]['cpl'] = result[0].spend / result[0].likes;
      }
      twentyFourHourArray.push(result);
      time = time.add(1, 'hour');
      // console.log(time.format('hh:mm a'));
    }
    // console.log(twentyFourHourArray);

    return twentyFourHourArray;

  }
});


