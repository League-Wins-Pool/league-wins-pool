/* eslint-env mocha */
// These are Chimp globals */
/* globals browser server assert */

const setup = () => {
  // we must navigate to client first so Meteor methods are available
  browser.url('http://localhost:3100');

  browser.timeouts('script', 5000);

  server.call('logout');

  browser.executeAsync(function (done) {
    Meteor.logout(done);
  });

  server.call('generateFixtures');

  browser.executeAsync(function (done) {
    Meteor.loginWithPassword('test@test.com', 'test', done);
  });

  browser.url('http://localhost:3100');
};

describe('PoolTeams.edit page ui', () => {
  beforeEach(() => {
    setup();

    // go to the Pools.show page
    browser.waitForVisible('h3.Pools_show');
    browser.click('h3.Pools_show>a');

    // go to PoolTeams.show page
    browser.waitForVisible('a.PoolTeams_show:nth-Child(1)');
    browser.click('a.PoolTeams_show:nth-Child(1)');

    browser.waitForVisible('a#PoolTeams_edit');
    browser.click('a#PoolTeams_edit');
  });

  it('can edit a pool team', () => {
    browser.waitForExist('input[name="userTeamName"]');
    browser.waitForValue('input[name="userTeamName"]');

    const newTeamName = 'new name';

    browser.setValue('input[name="userTeamName"]', newTeamName);
    browser.submitForm('form');

    browser.waitForExist('h3#PoolTeams_show_title');

    assert.equal(browser.getText('h3#PoolTeams_show_title'), newTeamName);
  });
});
