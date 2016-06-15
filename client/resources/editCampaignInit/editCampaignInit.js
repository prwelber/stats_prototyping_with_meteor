import { Meteor } from 'meteor/meteor';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.editCampaignInit.onRendered(() => {
  Session.set('limit', 25);
  Session.set('search', false);
});

Template.editCampaignInit.helpers({
  isReady: (sub) => {
    if (FlowRouter.subsReady(sub)) {
      return true;
    }
  },
  getCampaigns: () => {
    const limit = Session.get('limit');
    const search = Session.get('search');

    const opts = false;
    Meteor.subscribe("campaignInsightList", opts, Session.get('search'));
    if (! search) {
      return CampaignInsights.find({},
        {fields: {'data.initiative': 1, 'data.campaign_name': 1, 'data.campaign_id': 1}, limit: limit, sort: {'data.campaign_name': 1}}
      ).fetch();
    } else {
      // console.log("mongo search result", CampaignInsights.find({}, {fields: {'data.initiative': 1, 'data.campaign_name': 1, 'data.campaign_id': 1}, limit: 25, sort: [["score", "desc"]]}).fetch())
      return CampaignInsights.find(
        {},
        {fields: {'data.initiative': 1, 'data.campaign_name': 1, 'data.campaign_id': 1}, limit: 25, sort: [["score", "desc"]]}
      ).fetch();
    }
  },
  getInitiatives: () => {
    return Initiatives.find({}, {fields: {name: 1}, sort: {name: 1}});
  }
});

Template.editCampaignInit.events({
  "click .change-maker": (event, instance) => {
    const campName = event.target.attributes.name.value;
    const initName = instance.$("select[name='"+campName+"']").val()
    Meteor.call('changeCampaignInitiative', campName, initName, (err, res) => {
      if (! err) {
        console.log('change made successfully', res)
      }
    });


  },
  "keyup #search-campaigns": (event, instance) => {
    Session.set('search', event.target.value)
  }
});
