import { Meteor } from 'meteor/meteor'
Meteor.subscribe('fbAccountList');
Meteor.subscribe('accountList');
import MasterAccounts from '/collections/MasterAccounts';

Template.accounts.events({
  'click .refresh-accounts': function () {
    var target = document.getElementById("spinner-div");
    let spun = Blaze.render(Template.spin, target);
    Meteor.call('refreshAccountList', function (err, result) {
      if (err) {
          console.log(e);
      } else {
          Blaze.remove(spun);
      }
    });
  },
  'click .account-link': function () {
    if (Session.get('id') == Meteor.userId()) {
        console.log('you are propertly authenticated')
    }
  }
});

Template.accounts.helpers({
  'accountList': function () {
    let userId = Meteor.userId();
    if (userId) {
      // return MasterAccounts.find({
      //   "name": { "$in": [
      //     "Ruffino",
      //     "Woodbridge",
      //     // "Robert Mondavi Winery",
      //     "Kim Crawford",
      //     "Turtle Bay Resorts",
      //     "Churchill Downs"
      //   ]}
      // });
      return MasterAccounts.find({});
    }
  },
  'formatSpend': function (num) {
    // place a period two digits from the end
    // find the length and use substring?
    num = num.toString().split('');
    num.splice(num.length - 2, 0, '.');
    num = num.join('')
    return "$" + num
  },
  'sessionSetter': function () {
    let userId = Meteor.userId();
    Session.set('id', userId);
  }
});

Template.twitterAccounts.helpers({
  getTwitterAccounts: () => {
    let userId = Meteor.userId();
    if (userId) {
      return MasterAccounts.find({'data.platform': 'twitter'}, {sort: {'data.name': 1}});
    }
  }
});

Template.twitterAccounts.events({
  'click .get-twitter-accounts': (event, template) => {
    console.log('click registered!')
    Meteor.call('getTwitterAccounts', (err, res) => {
      console.log('res from getTwitterAccounts', res);
    });
  }
});

Template.index.events({
  "click .userLogout": (event, template) => {
    Meteor.logout( () => {
      console.log('user logged out');
    });
  }
});

Template.index.onRendered(function () {
  this.$(".dropdown-button").dropdown();
  $('.tooltipped').tooltip({delay: 10});
  $(".button-collapse").sideNav();
  Meteor.typeahead.inject();
});

Template.index.helpers({
  'getDate': function () {
    let date = new Date();
    date = date.toDateString();
    return date;
  },
  'getCampaignNumber': function () {
    return FlowRouter.current().params.campaign_id;
  },
  sessionBreadcrumb: (route) => {
    const session = Session.get('route');
    if (session === route) {
      return true;
    }
  },
  loggedInUser: () => {
    if (! Meteor.user()) {
      return false;
    } else {
      return true;
    }
  },
  whatRoute: (route) => {
    if (Session.get("route") === route) {
      return true;
    }
  },
  overviewRoute: (route) => {
    const sesh = Session.get("route")
    if (sesh === "overview" ||
        sesh === "charts" ||
        sesh === "breakdowns" ||
        sesh === "daybreakdowns" ||
        sesh === "hourlyBreakdowns" ||
        sesh === "targeting" ||
        sesh === "creative" ||
        sesh === "report" ||
        sesh === "deviceAndPlacement")
    {
      return true;
    }
  },
  'active': function (route) {
    return Session.get("route") === route ? "active" : '';
  },
  'getUser': () => {
    const user = Meteor.user();
    return user.firstName;
  },
  constellationUser: () => {
    const user = Meteor.user();
    if (user.agency) {
      if (user.agency.indexOf('Constellation') >= 0) {
        return true;
      }
    }
  },
  linkActive: (route) => {
    return Session.get('route') === route ? "orange": "";
  },
  buildQuery: (campaign_number, type) => {
    if (FlowRouter.getQueryParam('platform') === 'twitter') {
      const name = FlowRouter.getQueryParam('name');
      const initiative = FlowRouter.getQueryParam('initiative');
      const campaignId = FlowRouter.getQueryParam('campaign_id');
      const accountId = FlowRouter.getQueryParam('account_id');
      const startTime = FlowRouter.getQueryParam('start_time');
      const stopTime = FlowRouter.getQueryParam('stop_time');
      const platform = FlowRouter.getQueryParam('platform')

      const params = {campaign_id: campaignId};
      const queryParams = {
        name: name,
        initiative: initiative,
        campaign_id: campaignId,
        account_id: accountId,
        start_time: startTime,
        stop_time: stopTime,
        platform: platform
      };
      // if (type === 'daily') {
      //   return FlowRouter.path('/accounts/:campaign_id/daybreakdowns', params, queryParams);
      // }
      // if (type === 'overview') {
      //   return FlowRouter.path('/accounts/:campaign_id/overview', params, queryParams);
      // }
      // if (type === 'device') {
      //   return FlowRouter.path('/accounts/:campaign_id/devicebreakdowns', params, queryParams);
      // }

      switch (type) {
        case 'daily':
          return FlowRouter.path('/accounts/:campaign_id/daybreakdowns', params, queryParams);
          break;
        case 'overview':
          return FlowRouter.path('/accounts/:campaign_id/overview', params, queryParams);
          break;
        case 'device':
          return FlowRouter.path('/accounts/:campaign_id/devicebreakdowns', params, queryParams);
          break;
        default:
          return FlowRouter.path('/accounts/:campaign_id/overview', params, queryParams);
      }

    } else {

      const params = {
        campaign_id: campaign_number
      };
      if (type === 'overview') {
        return FlowRouter.path('/accounts/:campaign_id/overview', params);
      }
      if (type === 'daily') {
        return FlowRouter.path('/accounts/:campaign_id/daybreakdowns', params);
      }
      if (type === 'device') {
        return FlowRouter.path('/accounts/:campaign_id/devicebreakdowns', params);
      }
    }
  },
  isDisabled: () => {
    if(FlowRouter.getQueryParam('platform') === 'twitter') {
      return 'disabled';
    } else {
      return '';
    }
  }
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
});
