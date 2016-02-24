Meteor.subscribe('AdSetsList');

Template.adsets.helpers({
    'getAdSets': function () {
        console.log('checking for adSets');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let adSet = AdSets.findOne({campaign_id: campaignNumber});
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (adSet) {
            console.log('you should be seeing adSets');
            return AdSets.find({campaign_id: campaignNumber})
        } else {
            console.log('gotta get adSets for this one', campaignNumber);
            Meteor.call('getAdSets', campaignNumber, camp._id, camp.data.campaign_name)
        }
    },
    'getCampaignNumber': function () {
        let campaignNumber = FlowRouter.current().params.campaign_id;
        return campaignNumber;
    }
});
