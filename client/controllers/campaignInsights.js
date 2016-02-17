if (Meteor.isClient){

    Meteor.subscribe('campaignInsightList');

    Template.campaignInsights.onRendered(function () {
        // console.log(this)
    });

    Template.campaignInsights.events({
        'getBreakdowns': function () {

        }
    });

    Template.campaignInsights.helpers({
        'fetchInsights': function () {
            console.log('checking for insights');
            let campaignNumber = FlowRouter.current().params.campaign_id;
            if (CampaignInsightList.findOne({campaign_id: campaignNumber})) {
                console.log('you should be seeing insights')
                return CampaignInsightList.find({campaign_id: campaignNumber})
            } else {
                console.log('gotta get insights for this one', campaignNumber);
                Meteor.call('getInsights', campaignNumber)
            }
        },
        'currencyFormat': function (number) {
            function roundToTwo(num) {
                return +(Math.round(num + "e+2")  + "e-2");
            }
            if (roundToTwo(number)) {
                return "$"+roundToTwo(number)
            } else {
                return "N/A"
            }

        },
        'cleanText': function (text) {
            return text.replace("_", " ").toLowerCase();
        },
        'goBack': function () {
            let campaignNumber = FlowRouter.current().params.campaign_id;
            let camp = CampaignInsightList.findOne({campaign_id: campaignNumber})
            return camp.account_id;
        }
    });


}
