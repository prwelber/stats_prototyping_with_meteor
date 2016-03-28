var moment = require('moment');
var range = require('moment-range');
var Promise = require('bluebird');
// import Chart from "chart.js"

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    // console.log('Insights and Initiatives subs are now ready!');
  }
});


Template.charts.onCreated( function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
  });
  this.templateDict.set( 'initiative', initiative );

})

Template.charts.onRendered( function (){

});

Template.charts.events({

});

Template.charts.helpers({
  'topGenresChart': function () {
      const initiative = Template.instance().templateDict.get('initiative');
      // for getting evenly distrubuted output
      let labels = []; // this will be the date range
      let timeFormat = "MM-DD-YYYY";
      let days = moment(initiative.endDate, timeFormat).diff(moment(initiative.startDate, timeFormat), 'days');
      let avg = Math.round(initiative.quantity / days);
      let spendAvg = parseFloat(initiative.budget) / days;
      let avgData = [];
      let idealSpend = [];
      let idealSpendTotal = 0;
      let total = 0;
      for (let i = 0; i < days; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgData.push(total);
        idealSpend.push(idealSpendTotal);
      }

      // for getting x axis labels
      var start       = new Date(initiative.startDate),
          end         = new Date(initiative.endDate),
          dr          = moment.range(start, end),
          arrayOfDays = dr.toArray('days');
      
      arrayOfDays.forEach(el => {
        labels.push(moment(el).format("MM-DD"))
      });

      //for setting dealType
      let type;
      if (initiative.dealType === "CPM") {
        type = "impressions";
      } else if (initiative.dealType === "CPC") {
        type = "clicks";
      } else if (initiative.dealType === "CPL") {
        type = "like";
      }

      let actionToChart = [],
          spendChart    = [],
          spendTotal    = 0,
          totes         = 0;
      // seeing if Bluebird will work for promises and meteor.call
      var call = Promise.promisify(Meteor.call);

      call('aggregateForChart', initiative).then(function (res) {
        Session.set('res', res);
        // console.log('returned from Promise!', res)
        totes = res[0][type]
      }).catch(function (err) {
        console.log('uh no error', err)
      });


      for (let i = 0; i < Session.get('res').length; i++) {
        totes = totes + parseInt(Session.get('res')[i][type]);
        spendTotal = spendTotal + parseFloat(accounting.unformat(Session.get('res')[i].spend).toFixed(2));
        actionToChart.push(totes);
        spendChart.push(spendTotal);
      }
      // console.log(cpmChart);

      //  // this works. not sure why...
      // let asyncCall = function asyncCall (methodName, init, callback) {
      //   Meteor.call(methodName, init, function (err, res) {
      //     if (err) {
      //       throw new Meteor.Error('This is a Meteor Error!');
      //     } else {
      //       callback && callback(null, console.log("res:", res));
      //     }
      //   });
      // }

      // Meteor.call('aggregateForChart', initiative, function (err, res) {
      //   if (res) {
      //     console.log(res);
      //     Session.set("res", res);
      //   }
      // });
      // console.log("res:", Session.get("res"));

      // build chart
    return {

      chart: {
        zoomType: 'x'
      },

      title: {
        text: type.substr(0,1).toUpperCase() + type.substr(1, type.length) + " Delivery for Initiative"
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: type,
        shared: true,
        crosshairs: true
      },
      xAxis: {
        // type: 'datetime',
        categories: labels
      },

      yAxis: {
        title: {
          text: type
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      plotOptions: { // removes the markers along the plot lines
        series: {
          marker: {
            enabled: false
          }
        }
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },

      series: [{
        name: 'Ideal Distribution',
        data: avgData
      }, {
        name: 'Real Distribution',
        data: actionToChart
      }, {
        name: 'Spend',
        data: spendChart
      }, {
        name: 'Ideal Spend',
        data: idealSpend
      }]
    }

  },
  'costPerChart': function () {
    const initiative = Template.instance().templateDict.get('initiative');

    // for getting x axis labels
    let labels      = [],
        start       = new Date(initiative.startDate),
        end         = new Date(initiative.endDate);
        dr          = moment.range(start, end),
        arrayOfDays = dr.toArray('days');

    arrayOfDays.forEach(el => {
      labels.push(moment(el).format("MM-DD"))
    });

    //for setting dealType
    let type;
    if (initiative.dealType === "CPM") {
      type = "impressions";
    } else if (initiative.dealType === "CPC") {
      type = "clicks";
    } else if (initiative.dealType === "CPL") {
      type = "like";
    }

    let cpmChart = [],
        cpcChart = [],
        cplChart = [];

    // seeing if Bluebird will work for promises and meteor.call
    var call = Promise.promisify(Meteor.call);

    call('aggregateForChart', initiative)
    .then(function (res) {
      Session.set('costPerChart', res);
      // console.log('returned from costPerChart Promise!', res)
      totes = res[0][type]
    }).catch(function (err) {
      console.log('uh no error', err)
    });


    // let cpvvChart = [];
    // let postEngagementChart = [];
    for (let i = 0; i < Session.get('costPerChart').length; i++) {
      cpmChart.push(Session.get('costPerChart')[i].cpm);
      cpcChart.push(Session.get('costPerChart')[i].cpc);
      cplChart.push(Session.get('costPerChart')[i].cost_per_like);
      // cpvvChart.push(Session.get('costPerChart')[i].cost_per_video_view);
      // postEngagementChart.push(Session.get('costPerChart')[i].cost_per_post_engagement);
    }



    // build chart
    return {

      chart: {
        zoomType: 'x'
      },

      title: {
        text: "Cost per Type for Initiative"
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: '',
        shared: true,
        crosshairs: true
      },
      xAxis: {
        // type: 'datetime',
        categories: labels
      },

      yAxis: {
        title: {
          text: type
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      plotOptions: { // removes the markers along the plot lines
        series: {
          marker: {
            enabled: false
          }
        }
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },

      series: [{
        name: 'CPM',
        data: cpmChart
      }, {
        name: 'CPC',
        data: cpcChart
      }, {
        name: 'CPL',
        data: cplChart
      }]
    } // end of chart return
  },
  'dualAxes': function () {
    const initiative = Template.instance().templateDict.get('initiative');

    // for getting x axis labels
    let labels = [];
    var start = new Date(initiative.startDate);
    var end   = new Date(initiative.endDate);
    var dr    = moment.range(start, end);
    var arrayOfDays = dr.toArray('days');
    arrayOfDays.forEach(el => {
      labels.push(moment(el).format("MM-DD"))
    });

    //for setting dealType
    let type;
    let costType;
    if (initiative.dealType === "CPM") {
      type = "impressions";
      costType = "cpm";
    } else if (initiative.dealType === "CPC") {
      type = "clicks";
      costType = "cpc";
    } else if (initiative.dealType === "CPL") {
      type = "like";
      costType = "cost_per_like";
    }
    let total = 0;
    let actionArray = [];
    let costPerArray = [];

    // seeing if Bluebird will work for promises and meteor.call
    var call = Promise.promisify(Meteor.call, {context: Meteor});

    call('aggregateForChart', initiative).then(function (res) {
      console.log('returned from dualAxes Promise!', res);
      Session.set('dualAxes', res);
    }).catch(function (err) {
      console.log('uh no error', err)
    });

       Session.get('dualAxes').forEach(el => {
        //  total += el.impressions;
         actionArray.push(el.impressions);
         costPerArray.push(el.cpm);
       });
       console.log(actionArray);
       console.log(costPerArray);

    // console.log("sesh test", Session.get('dualAxes'))




    return {
      chart: {
        zoomType: 'xy'
      },
      title: {
        text: type + ' & cost per'
      },
      xAxis: [{
        categories: labels,
        crosshair: true
      }],
      yAxis: [{
        // left axis
        labels: {
          format: 'CPM',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: 'CPM',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }
      }, {
      // right axis
      title: {
        text: type,
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      labels: {
        format: type,
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      opposite: true

      }],
      tooltip: {
        shared: true,
        crosshairs: true
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        x: 120,
        verticalAlign: 'top',
        y: 50,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
      },
      series: [{
        //right axis
        name: type,
        type: 'column',
        yAxis: 1,
        data: actionArray,
        tooltip: {
          valueSuffix: ' ' + type
        }
      }, {
        //left axis
        name: 'CPM',
        type: 'spline',
        data: costPerArray,
        tooltip: {
          valueSuffix: 'CPM'
        }
      }]
    } // end of chart return
  }
});

Template.charts.onDestroyed(func => {

});

function random() {
  return Math.floor((Math.random() * 500) + 1);
}
