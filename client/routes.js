import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'

FlowRouter.route('/', {
    name: 'landing',
    action: () => {
        BlazeLayout.render('landing')
    }
});

FlowRouter.route('/home', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: 'index',
    action: () => {
        Session.set("route", "home");
        BlazeLayout.render('index', {main: 'initiativesHome', other: 'timing'});
    }
});

FlowRouter.route('/terms', {
    name: "terms",
    action: () => {
        BlazeLayout.render('terms');
    }
});

FlowRouter.route('/initiatives/:_id/homepage', {
    subscriptions: function (params) {
        if (/homepage/.test(FlowRouter.current().path) === true) {
            params["page"] = "homepage";
        }
        this.register('Initiatives', Meteor.subscribe('Initiatives', params._id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params._id));
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params));
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params._id));
        this.register('Uploads', Meteor.subscribe('Uploads', params));
    },
    name: 'initiativeHomepage',
    action: function () {

        Session.set("route", "initiativeHomepage");
        BlazeLayout.render('index', {main: 'initiativeHomepage', tasks: 'taskTracker'})
    }
});

FlowRouter.route('/viewaccounts', {
    name: "viewAccounts",
    action: function () {
        Session.set("route", "home");
        BlazeLayout.render('index', {main: 'accounts'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    subscriptions: function (params) {
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params.account_id));
    },
    name: 'accountOverview',
    action: function (params) {
        BlazeLayout.render('index', {main: 'accountOverview', test: 'passing data through render function'});
    }
});

FlowRouter.route('/accounts/:campaign_id/dashboard', {
  subscriptions: function () {
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
    this.register('Initiatives', Meteor.subscribe('Initiatives'));
    this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList'));
  },
  name: 'campaignDashboard',
  action: function (params) {
    BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'campaignInsights'});
  }
});

FlowRouter.route('/accounts/:campaign_id/overview', {
  subscriptions: function (params) {
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
    this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params.campaign_id));
    this.register('Initiatives', Meteor.subscribe('Initiatives'));
    this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params.campaign_id));
  },
  name: 'campaignInsights',
  action: function (params) {
    Session.set("route", "overview");
    BlazeLayout.render('index', {main: 'campaignDashboard', projection: 'projections', dash: 'campaignInsights'});
  }
});

FlowRouter.route('/accounts/:campaign_id/charts', {
  subscriptions: function (params) {
    this.register('Initiatives', Meteor.subscribe('Initiatives'));
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
  },
  name: 'charts',
  action: function (params) {
    Session.set("route", "charts");
    BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'charts'});
  }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    subscriptions: function (opts) {
        this.register('insightsBreakdownList', Meteor.subscribe('insightsBreakdownList', opts.campaign_id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', opts.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
    },
    name: 'insightsBreakdown',
    action: function (params) {
        Session.set("route", "breakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'insightsBreakdown'});
    }
});

FlowRouter.route('/accounts/:campaign_id/daybreakdowns', {
    subscriptions: function (params) {
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params.campaign_id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
    },
    name: 'insightsBreakdownDaily',
    action: function (params) {
        Session.set("route", "daybreakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'insightsBreakdownDaily'});
    }
});

FlowRouter.route('/accounts/:campaign_id/hourlybreakdowns', {
    subscriptions: function (params) {
        this.register('hourlyBreakdownsList', Meteor.subscribe('hourlyBreakdownsList', params.campaign_id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
    },
    name: 'hourlyBreakdowns',
    action: function (params) {
        Session.set("route", "hourlyBreakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'hourlyBreakdowns'});
    }
});

FlowRouter.route('/accounts/:campaign_id/targeting', {
    subscriptions: function (opts) {
        this.register('AdSetsList', Meteor.subscribe('AdSetsList', opts.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
        this.register("campaignInsightList", Meteor.subscribe("campaignInsightList", opts.campaign_id));
    },
    name: 'adsets',
    action: function (parrams) {
        Session.set("route", "targeting");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'adsets'});
    }
});

FlowRouter.route('/accounts/:campaign_id/creative', {
    subscriptions: function (opts) {
        this.register('AdsList', Meteor.subscribe('AdsList', opts.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
        this.register("campaignInsightList", Meteor.subscribe("campaignInsightList", opts.campaign_id));
    },
    name: 'ads',
    action: function (params) {
        Session.set("route", "creative");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'ads'});
    }
});

FlowRouter.route('/admin/', {
    name: "admin",
    action: function () {
        BlazeLayout.render('index', {main: "admin"});
    }
});

// ------------------------- AGGREGATIONS ----------------- //

FlowRouter.route('/admin/aggregations', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "aggregations",
    action: function () {
        BlazeLayout.render('index', {main: "aggregations"});
    }
});

// ------------------------- AGENCIES --------------------- //

FlowRouter.route('/admin/agencies/new', {
    name: 'newAgency',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newAgency'});
    }
});

FlowRouter.route('/admin/agencies/:_id/update', {
    name: 'updateAgency',
    action: function (params) {
        BlazeLayout.render('index', {main: 'updateAgency'});
    }
});

FlowRouter.route('/admin/agencies', {
    name: 'agencies',
    action: function () {
        BlazeLayout.render('index', {main: 'agencies'});
    }
});

// --------------------- BRANDS ----------------------- //

FlowRouter.route('/admin/brands/new', {
    name: "newBrand",
    action: function () {
        BlazeLayout.render('index', {main: 'newBrand'});
    }
});

FlowRouter.route('/admin/brands/', {
    name: "brands",
    action: function () {
        BlazeLayout.render('index', {main: 'brands'});
    }
});

FlowRouter.route('/admin/brands/:account_id/update', {
    name: "updatebrand",
    action: function () {
        BlazeLayout.render('index', {main: 'updateBrand'});
    }
});

// ---------------------- USERS ------------------------ //

FlowRouter.route('/admin/users/', {
    name: "users",
    action: function () {
        BlazeLayout.render('index', {main: 'allUsers'})
    }
});

FlowRouter.route('/admin/users/:_id/edit', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "editUser",
    action: function (params) {
        BlazeLayout.render('index', {main: 'editUser'});
    }
});

FlowRouter.route('/admin/users/create', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "createUser",
    action: function () {
        BlazeLayout.render('index', {main: "createUser"});
    }
});

// -------------------- INITIATIVES ------------------------ //

FlowRouter.route('/admin/initiatives/', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "initiatives",
    action: function () {
        BlazeLayout.render('index', {main: "initiatives"});
    }
});

FlowRouter.route('/admin/initiatives/:_id', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "initiative",
    action: function () {
        BlazeLayout.render('index', {main: "initiative"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/edit', {
    subscriptions: function (params) {
        if (/edit/.test(FlowRouter.current().path) === true) {
            params["page"] = "edit";
        }
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params));
    },
    name: "editInitiative",
    action: function () {
        BlazeLayout.render('index', {main: "editInitiative"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/edit/campaigns', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
    },
    name: "editInitiativeCampaigns",
    action: function () {
        BlazeLayout.render('index', {main: "editInitiativeCampaigns"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/aggregate', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "initiativeAggregate",
    action: function () {
        BlazeLayout.render('index', {main: "initiativeAggregate"});
    }
});

FlowRouter.route('/initiatives/new', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: 'newInitiative',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newInitiative'});
    }
});

FlowRouter.route('/terms', {
    name: "terms",
    action: function () {
        BlazeLayout.render('index', {main: "terms"});
    }
});