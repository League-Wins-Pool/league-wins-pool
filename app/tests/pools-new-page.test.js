/* eslint-env mocha */
// These are Chimp globals */
/* globals browser server assert */

import { timeout, clickElement } from '../.testing/chimp-shared';

const setup = () => {
  // we must navigate to client first so Meteor methods are available
  browser.url('http://localhost:3100');

  browser.timeouts('script', 5000);
  browser.timeouts('implicit', 5000);
  browser.timeouts('page load', 5000);

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

describe('Pools.new page ui', () => {
  beforeEach(() => {
    setup();

    clickElement('a#Pools_new_link');
  });

  it('can create a pool', () => {
    const newTitle = 'pool name';

    browser.waitForVisible('input#name', timeout);
    browser.setValue('input#name', newTitle);

    browser.submitForm('form');

    browser.waitForExist('h3.Pools_show', timeout);

    assert.equal(browser.getText('#Pools_title'), `2015 ${newTitle}`);
  });
});
