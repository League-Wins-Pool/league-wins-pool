const page = {
  getUserTeamNameSelector: () => 'input[name="userTeamName"]',
  getDeleteButtonSelector: () => 'a[href="#afModal"]',
  getDeleteButtonInModalSelector: () => 'button.btn-danger', // fragile way of doing this but good enough for now
  getPoolShowSelector: () => 'h3.poolsShow',
  getPoolTeamShowSelector: () => 'h3.poolTeamsShow',
};

describe('poolTeamsEdit page', () => {
  beforeEach(loginWithDefaultUser);
  beforeEach(createDefaultPool);
  beforeEach(createDefaultPoolTeam);
  beforeEach(goToPoolsShowPage); // needed so we get subscription to PoolTeams
  beforeEach(goToPoolTeamsEditPage);

  let spec;
  spec = it('should edit a pool team', done => {
    log.info(`spec: `, spec.description);

    const userTeamName = "Billy's Dummies";

    waitForSubscription(PoolTeams.find(), function() {
      $(page.getUserTeamNameSelector()).val(userTeamName);

      $('form').submit();

      // make sure we redirect to poolShow page
      waitForElement(page.getPoolTeamShowSelector(), function() {

        waitForSubscription(PoolTeams.find({ userTeamName }), function() {
          const poolTeam = PoolTeams.findOne({ userTeamName });
          expect(poolTeam).not.toBe(undefined);
          log.debug(`poolTeam: `, poolTeam);
          expect(poolTeam.userTeamName).toBe(userTeamName, 'userTeamName');

          done();
        });
      });
    });
  });

  spec = it('should delete a pool team', done => {
    log.info(`spec: `, spec.description);

    waitForSubscription(PoolTeams.find(), function() {
      $(page.getDeleteButtonSelector()).click();

      waitForElement(page.getDeleteButtonInModalSelector(), function() {
        Meteor.setTimeout(function () {
          // this is needed because clicking too early on the button does nothing
          // it's as if the click() handler isn't setup until the modal animates,
          // but I don't know how to detect when the click handler is ready
          $(page.getDeleteButtonInModalSelector()).click();
        }, 1000);

        waitForMissingElement(page.getDeleteButtonInModalSelector(), function() {

          // make sure we redirect to poolShow page
          waitForElement(page.getPoolShowSelector(), function () {

            // make sure pool team is deleted
            waitForEmptySubscription(PoolTeams.find(), function () {
              done();
            });
          });
        });
      });
    });
  });
});
