import { Migrations } from 'meteor/percolate:migrations';
import moment from 'moment';
import { Seasons } from '../../imports/api/seasons/seasons';
import LeagueFinder from '../../imports/api/leagues/finder';

Migrations.add({
  version: 2,
  name: 'Adds startDate and endDate to Seasons',
  up: () => {
    const nflLeague = LeagueFinder.getByName('NFL');
    if (! nflLeague) throw new Error('NFL league not found!');
    Seasons.update({ leagueId: nflLeague._id, year: 2015 },
      { $set: {
        startDate: moment('2015-09-10').toDate(),
        endDate: moment('2016-01-03').toDate(),
      } }
    );
    Seasons.update({ leagueId: nflLeague._id, year: 2014 },
      { $set: {
        startDate: moment('2014-09-04').toDate(),
        endDate: moment('2015-12-28').toDate(),
      } }
    );

    const nbaLeague = LeagueFinder.getByName('NBA');
    if (! nbaLeague) throw new Error('NBA league not found!');
    Seasons.update({ leagueId: nbaLeague._id, year: 2015 },
      { $set: {
        startDate: moment('2015-10-27').toDate(),
        endDate: moment('2016-04-13').toDate(),
      } }
    );
  },
  down: () => {
    Seasons.update({}, { $unset: { startDate: '', endDate: '' } }, { multi: true });
  },
});
