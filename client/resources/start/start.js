import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import MasterAccounts from '/collections/MasterAccounts';
import dragula from 'dragula';
import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages';
import { Session } from 'meteor/session';
import { calcNet } from '/both/utilityFunctions/calcNet';


// ----------- FUNCTIONS ------------ //

const getDateRange = function getDateRange(items) {
  let earliest;
  let latest;
  const format = 'MM/DD/YYYY';

  for (let i = 0; i < items.length - 1; i++) {

    if (! earliest || moment(items[i].startDate, moment.ISO_8601).isBefore(moment(earliest, format))) {
      earliest = moment(items[i].startDate, moment.ISO_8601).format(format);
    }
    if (! latest || moment(items[i].endDate, moment.ISO_8601).isAfter(moment(latest, format))) {
      latest = moment(items[i].endDate, moment.ISO_8601).format(format);
    }

  }
  return {
    start: earliest,
    end: latest
  }
}

// ---------- END FUNCTIONS ---------- //




Template.initiativesHome.onCreated(function () {
  if (!Session.get("initiativeSelect")) {
    Session.set("initiativeSelect", 'Active');
  }
  if (!Session.get("ownerSelect")) {
    Session.set("ownerSelect", null);
  }
})

Template.initiativesHome.onRendered(function () {
  Meteor.typeahead.inject();
  $('.tooltipped').tooltip({ delay: 50 });
  Session.set('dateSort', {'lineItems.0.endDate': 1});




});


Template.initiativesHome.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  settings: function() {
    return {
      position: "top",
      limit: 10,
      rules: [
        {
          token: '',
          collection: Initiatives,
          field: "name",
          options: '',
          matchAll: true,
          // filter: { type: "autocomplete" },
          template: Template.dataPiece
        }
      ]
    };
  },
  'getAllInitiatives': () => {
    const sesh = Session.get('initiativeSelect');
    const owner = Session.get('ownerSelect');
    const brand = Session.get('brandSelect');
    const agency = Session.get('agencySelect');
    const n = moment().toISOString();
    let inits;
    // const endDateSort = Session.get('endDateSort');
    const dateSort = Session.get('dateSort');
    const alphaSort = Session.get('alphaSort');

    if (owner === 'All') { Session.set("ownerSelect", null) };

    /*
      messy here, need to REFACTOR. this is a if/else tree that
      uses initiativeSelect and ownerSelect to fetch initiatives from the
      database. the basic logic for owner is that if the owner session does
      not equal "All", search with whatever the ownerSesh is. when the
      template is created, intiativeSelect is set to "Active" and ownerSelect
      is set to "null"
    */
    let date;
    let now = moment().toISOString();
    let active;
    let status = {};
    let query = {};

    if (sesh === 'Ending Soon') {
      date = moment().add(30, 'd').toISOString();
      status = {$lte: date, $gte: now};

      owner ?
        query = {'lineItems.0.endDate': status, owner: owner} :
        query = {'lineItems.0.endDate': status};


    } else if (sesh === 'Recently Ended') {
      date = moment().subtract(30, 'd').toISOString();
      status = {$gte: date, $lte: now};

      owner ?
        query = {'lineItems.0.endDate': status, owner: owner} :
        query = {'lineItems.0.endDate': status};

    } else if (sesh === 'Pending') {

      status = {$gte: now};
      query = {'lineItems.0.startDate': status};

    } else if (sesh === 'Active') {
      active = true;

      owner ?
        query = {userActive: active, owner: owner} :
        query = {userActive: active};

    } else if (sesh === 'All') {
      owner ?
        query = {owner: owner} :
        query = {};
    }

    if (brand) { query = {brand: brand} };
    if (agency) { query = {agency: agency} };

    return Initiatives.find(query, {sort: dateSort})

  },
  'isActiveInitiative': function () {
    const now = moment()
    const format = 'MM/DD/YYYY';
    const dates = getDateRange(this.lineItems);
    // dates.start dates.end



    if (moment(dates.start, format).isAfter(now)) {
      return "Pending";
    }

    if (moment(dates.end, format).isAfter(now)) {
      return "Active";
    } else if (now.diff(moment(dates.end, format), 'd') === 0) {
      return "Active";
    } else if (now.diff(moment(dates.end, format), "days") <= 45) {
      return "Ended Recently";
    } else {
      return "Ended";
    }
  },
  'isActiveClass': function () {
    const now = moment();
    const format = 'MM/DD/YYYY';
    const dates = getDateRange(this.lineItems);

    if (moment(dates.start, format).isAfter(now)) {
      return "blue-text";
    }

    if (moment(dates.end, format).isAfter(now)) {
      return "green-text";
    } else if (now.diff(moment(dates.end, format), 'd') === 0) {
      return "green-text";
    } else if (now.diff(moment(dates.end, format), "days") <= 45) {
      return "orange-text";
    } else {
      return "red-text";
    }
  },
  'formatDate': (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY");
  },
  'assignAgency': () => {
    return this.agency;
  },
  'assignBrand': () => {
    return this.brand;
  },
  userInfo: () => {
    return Meteor.user();
  },
  getOwner: () => {
    return this.owner;
  },
  calcSpend: (objective, _id, state, index) => {
    const init = Initiatives.findOne({_id: _id});
    const allCapsObjective = objective.split(' ').join('_').toUpperCase();
    // --- FUNCTION EXPRESSION --- //
    const refreshInits = function refreshInits (init, objective) {
      const spendPercent = init[objective]['net']['spendPercent'];
      if (spendPercent === null || spendPercent === 0 || spendPercent === NaN || spendPercent === undefined) {
        // console.log('running refresh with', init.name)
        // Meteor.call('aggregateObjective', init.name);
        calcNet.calculateNetNumbers(init.name);
      }
    }

    try {
      refreshInits(init, allCapsObjective);
    } catch (e) {
      console.log('Error in start.js refreshing init', e, init.name, allCapsObjective)
    }

    /*
      1. get the start and end date from init line item
      2. get those daily insights for time frame
      3. total up spend for those days by doing delivery times cost per amount
        - for example, total up clicks over time frame and multi by CPC
      4. turn into percentage or number depending on state

      ISSUES/THOUGHTS:
      - don't want to bring all daily insights to client -->
        - would take a while for start page to load up every time
      - should we make server call (could take a while for each initiative)
      - could run a background function that is calculating these totals
        - and attaching them to initiative object for easy access
    */

    // get new line item results data
    const lineItemResults = init.lineItems[index]['results'];

    if (! lineItemResults.clientSpendPercentage) {
      return '0';
    } else if (state === 'circle') {
      return parseInt(lineItemResults.clientSpendPercentage);
    } else if (state === 'number') {
      return parseInt(lineItemResults.clientSpendPercentage);
    }

    // return lineItemResults.clientSpendPercentage.toFixed(2);

    // for (let key in init) {
    //   if (key === allCapsObjective) {
    //     if (! init[key]['net']) {
    //       return '';
    //     } else {
    //       if (parseFloat(init[key]['net']['spendPercent']) >= 100 && state === "circle") {
    //         return "100";
    //       } else if (parseFloat(init[key]['net']['spendPercent']) >= 100 && state === "number") {
    //         if (Meteor.user().admin === false) {
    //           return "100"
    //         } else {
    //           return numeral(init[key]['net']['spendPercent']).format("00");
    //         }
    //       } else {
    //         return numeral(init[key]['net']['spendPercent']).format("00");
    //       }
    //     }
    //   }
    // }
  },
  calcDelivery: (_id, index, state) => {
    const init = Initiatives.findOne({_id: _id});

    const deliveryPercentage = init.lineItems[index]['results']['actionsPercentage'];
    if (! deliveryPercentage) {
      return "0";
    }

    if (deliveryPercentage >= 100 && state === "circle") {
      return "100";
    } else if (deliveryPercentage >= 100 && state === "number") {
      return numeral(deliveryPercentage).format("00");
    } else {
      return numeral(deliveryPercentage).format("00");
    }

    // if (parseFloat(initiativesFunctionObject.calculateDeliveryPercent(init, index)) >= 100 && state === "circle") {
    //   return "100";
    // } else if (parseFloat(initiativesFunctionObject.calculateDeliveryPercent(init, index)) >= 100 && state === "number") {
    //   return numeral(initiativesFunctionObject.calculateDeliveryPercent(init, index)).format("00");
    // } else {
    //   return numeral(initiativesFunctionObject.calculateDeliveryPercent(init, index)).format("00");
    // }
  },
  calcFlight: (_id, index) => {
    const init = Initiatives.findOne({_id: _id});
    if (parseFloat(initiativesFunctionObject.calculateFlightPercentage(init, index)) >= 100) {
      return "100";
    } else {
      return numeral(initiativesFunctionObject.calculateFlightPercentage(init, index)).format("00");
    }
  },
  activeUpdates: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.userActive === true) {
      return "checked";
    } else {
      return "";
    }
  },
  checkedToday: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.dailyCheck) {
      return "True";
    } else {
      return "False";
    }
  },
  getBrands: () => {
    return MasterAccounts.find({}, {sort: {name: 1}});
  },
  factorCheckArrow: () => {
    return 'down'
  },
  factorCheckColor: () => {
    return 'green'
  },
  factorCheckActual: (_id, index) => {
    const init = Initiatives.findOne({_id: _id});
    const lineItem = init.lineItems[index]
    const dealType = lineItem.dealType.toLowerCase(); // eg. cpc vs CPC
    const contractedPrice = lineItem.price;
    const objective = lineItem.objective.replace(/ /g, "_").toUpperCase();

    return init[objective][dealType]
  },
  factorCheckClient: (_id, index) => {
    const init = Initiatives.findOne({_id: _id});
    const lineItem = init.lineItems[index]
    const dealType = lineItem.dealType.toLowerCase(); // eg. cpc vs CPC
    const contractedPrice = lineItem.price;
    const objective = lineItem.objective.replace(/ /g, "_").toUpperCase();

    return init[objective]['net']['client_'+dealType];

  },
  dateFormat: (date) => {
    return moment(date, moment.ISO_8601).format('MM/DD');
  },
  initiativeDateRange: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    const dateObject = getDateRange(init.lineItems);
    return `${dateObject.start} - ${dateObject.end}`;
  }
});








Template.initiativesHome.events({
 "click .userLogout": (event, template) => {
    Meteor.logout( () => {
      console.log('user logged out');
    });
 },
 "click .switch": (event, instance) => {
  let _id, checked;
  if (event.target.dataset.id) { _id = event.target.dataset.id };
  checked = event.target.checked;
  if (_id && (checked === true || checked === false)) {
    Meteor.call('changeActiveStatus', _id, checked);
    }
  },
  "change #initiativeSelect": (event, instance) => {
    Session.set("agencySelect", null);
    Session.set("brandSelect", null);
    Session.set('initiativeSelect', event.target.value);
  },
  "change #ownerSelect": (event, instance) => {
    Session.set("agencySelect", null);
    Session.set("brandSelect", null);
    if (event.target.value === "null") {
      Session.set('ownerSelect', null)
    } else {
      Session.set('ownerSelect', event.target.value);
    }
  },
  "change #agencySelect": (event, instance) => {
    Session.set("brandSelect", null);
    Session.set("ownerSelect", null);
    Session.set("initiativeSelect", null);
    Session.set('agencySelect', event.target.value);
  },
  "change #brandSelect": (event, instance) => {
    Session.set("agencySelect", null);
    Session.set("ownerSelect", null);
    Session.set("initiativeSelect", null);
    Session.set('brandSelect', event.target.value);
  },
  "click #alpha-sort": (event, instance) => {
    var date = Session.get('dateSort')

    if (date['lineItems.0.endDate']) {
      delete date['lineItems.0.endDate']
    } else if (date['lineItems.0.startDate']) {
      delete date['lineItems.0.startDate']
    }

    if (!date['name']) {
      date['name'] = 1;
      Session.set('dateSort', date);
    } else if (date['name'] === 1) {
      date['name'] = -1
      Session.set('dateSort', date);
    } else if (date['name'] === -1) {
      date['name'] = 1
      Session.set('dateSort', date);
    }
  },
  "click #end-date-sort": (event, instance) => {
    Session.get('dateSort')['lineItems.0.endDate'] === 1 ?
     Session.set('dateSort', {'lineItems.0.endDate': -1}) :
     Session.set('dateSort', {'lineItems.0.endDate': 1});
  },
  "click #start-date-sort": (event, instance) => {
    Session.get('dateSort')['lineItems.0.startDate'] === 1 ?
     Session.set('dateSort', {'lineItems.0.startDate': -1}) :
     Session.set('dateSort', {'lineItems.0.startDate': 1});
  }
});

Template.initiativesHome.onDestroyed(() => {
  // Session.set("ownerSelect", null);
  // Session.set("initiativeSelect", null);
  Session.set("agencySelect", null);
  Session.set("brandSelect", null);
  $('.tooltipped').tooltip('remove');
})





