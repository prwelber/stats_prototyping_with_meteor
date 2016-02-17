if (Meteor.isClient) {

    Meteor.subscribe('fbAccountList');

    Template.accounts.events({

        'click .refresh-accounts': function () {
            let userId = Meteor.userId();
            if (!userId) {
                console.log('no user - can\'t update');
                alert('You are not logged in.')
            } else {
                let now = moment().format("MM-DD-YYYY");
                let account = FacebookAccountList.findOne();
                if (!account) {
                    Meteor.call('refreshAccountList');
                } else {
                    let inserted = account.inserted;
                    let timeDelta = moment(now, "MM-DD-YYYY").diff(moment(inserted, "MM-DD-YYYY"), 'hours');
                    if (timeDelta >= 168) {
                        alert('accounts have not been updated in over one week and it has been '+timeDelta+' hours since the last update');
                        Meteor.call('refreshAccountList')
                    } else {
                        alert('accounts are less than one week old and it has been '+timeDelta+' hours since the last update')
                    }
                }
            }
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
            Session.set('userId', userId)
            if (userId) {
                return FacebookAccountList.find({})
            }
        }
    })

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
      });


    Template.landing.helpers({
        'getDate': function () {
            let date = new Date();
            date = date.toDateString();
            return date;
        }
    });


};


