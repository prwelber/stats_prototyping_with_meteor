FlowRouter.route('/', {
    name: 'index',
    action: function () {
        Session.set("route", "home");
        BlazeLayout.render('index', {main: 'accounts', other: 'timing'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    subscriptions: function () {
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList'));
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
  },
  name: 'campaignDashboard',
  action: function (params) {
    BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'campaignInsights'});
  }
});

FlowRouter.route('/accounts/:campaign_id/overview', {
  subscriptions: function () {
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
    this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList'));
    this.register('Initiatives', Meteor.subscribe('Initiatives'));
  },
  name: 'campaignInsights',
  action: function (params) {
    Session.set("route", "overview");
    BlazeLayout.render('index', {main: 'campaignDashboard', tasks: 'taskTracker', dash: 'campaignInsights'});
  }
});

FlowRouter.route('/accounts/:campaign_id/charts', {
  // subscriptions: function () {
  //   this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
  //   this.register('Initiatives', Meteor.subscribe('Initiatives'));
  // },
  name: 'charts',
  action: function (params) {
    Session.set("route", "charts");
    BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'charts'});
  }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    subscriptions: function () {
        this.register('insightsBreakdownList', Meteor.subscribe('insightsBreakdownList'));
    },
    name: 'insightsBreakdown',
    action: function (params) {
        Session.set("route", "breakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'insightsBreakdown'});
    }
});

FlowRouter.route('/accounts/:campaign_id/daybreakdowns', {
    subscriptions: function () {
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList'));
    },
    name: 'insightsBreakdownDaily',
    action: function (params) {
        Session.set("route", "daybreakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'insightsBreakdownDaily'});
    }
});

FlowRouter.route('/accounts/:campaign_id/hourlybreakdowns', {
    subscriptions: function () {
        this.register('hourlyBreakdownsList', Meteor.subscribe('hourlyBreakdownsList'));
    },
    name: 'hourlyBreakdowns',
    action: function (params) {
        Session.set("route", "hourlyBreakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'hourlyBreakdowns'});
    }
});

FlowRouter.route('/accounts/:campaign_id/targeting', {
    subscriptions: function () {
        this.register('AdSetsList', Meteor.subscribe('AdSetsList'));
    },
    name: 'adsets',
    action: function (parrams) {
        Session.set("route", "targeting");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'adsets'});
    }
});

FlowRouter.route('/accounts/:campaign_id/creative', {
    subscriptions: function () {
        this.register('AdsList', Meteor.subscribe('AdsList'));
    },
    name: 'ads',
    action: function (parrams) {
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

FlowRouter.route('/admin/users/', {
    name: "users",
    action: function () {
        BlazeLayout.render('index', {main: 'allUsers'})
    }
});

FlowRouter.route('/admin/users/:_id/edit', {
    name: "newUser",
    action: function (params) {
        BlazeLayout.render('index', {main: 'newUser'});
    }
});

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
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "editInitiative",
    action: function () {
        BlazeLayout.render('index', {main: "editInitiative"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/edit/campaigns', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
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
