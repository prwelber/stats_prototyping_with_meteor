Meteor.subscribe('agenciesList')

Template.agencies.helpers({
    'getAgencies': function () {
        return Agencies.find();
    }
})


Template.newAgency.helpers({
    'getBrands': function () {
        return Accounts.find()
    }
});

// for testing exporting:
let person = {
    name: 'phil',
    age: 30,
    dogs: ['cooper', 'nelly']
};

Template.newAgency.events({
    "submit .new-agency-form": function (event, template) {
        event.preventDefault();
        let name = event.target.name.value;
        let location = event.target.location.value;
        // on submit, find all DOM elements of type "input checkbox" that are
        // checked and then create new array of just the defaultValues
        let selected = template.findAll("input[type=checkbox]:checked");
        let array = _.map(selected, function(item) {
            return item.value;
        });
        Meteor.call('insertNewAgency', name, array, location);
    }
});
export {person};
