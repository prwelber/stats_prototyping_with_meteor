import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Agencies from '/collections/Agencies';

Template.agencies.helpers({
    'getAgencies': function () {
        return Agencies.find().fetch();
    }
});

Template.updateAgency.helpers({

});

Template.agencies.events({
    "click .delete-agency": function (event, template) {
        let agencyId = event.target.dataset.identifier;
        Meteor.call("deleteAgency", agencyId);
    }
});

Template.newAgency.helpers({

});


Template.newAgency.events({
    "submit .new-agency-form": function (event, template) {
        event.preventDefault();
        let name = event.target.name.value;
        let location = event.target.location.value;
        // on submit, find all DOM elements of type "input checkbox" that are
        // checked and then create new array of just the defaultValues
        // let selected = template.findAll("input[type=checkbox]:checked");
        // let brands = _.map(selected, function(item) {
        //     return item.value;
        // });
        let inserted = moment().format("MM-DD-YYYY hh:mm a");

        let d = {
            name: name,
            location: location,
            inserted: inserted
        };
        Meteor.call('insertNewAgency', d, function (error, result) {
            if (result) {
                alert('Agency Created');
                FlowRouter.go('/admin');
            }
        });
    }
});

Template.updateAgency.helpers({
    "getAgency": function () {
        let agencyId = FlowRouter.current().params._id;
        return Agencies.findOne(agencyId)
    }
})

Template.updateAgency.events({
    "submit .update-agency-form": function (event, template) {
        event.preventDefault();
        let name = event.target.name.value;
        let location = event.target.location.value;
        let selected = template.findAll("input[type=checkbox]:checked");
        let brands = _.map(selected, function(item) {
            return item.value;
        });
        let d = {};
        d['_id'] = FlowRouter.current().params._id;
        d['name'] = name;
        d['brands'] = brands;
        d['location'] = location;
        Meteor.call("updateAgency", d, function (error, result) {
            if (result) {
                $("#message-box").append("Agency has been updated!");
            }
        });
    }
});

Template.newAgency.onDestroyed(function () {
});
Template.updateAgency.onDestroyed(function () {
});
