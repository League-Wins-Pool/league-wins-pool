/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/
Template.home.events({
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.home.helpers({
  isLoggedIn: () => !!Meteor.user(),
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.home.onCreated(function () {
});

Template.home.onRendered(function () {
});

Template.home.onDestroyed(function () {
});