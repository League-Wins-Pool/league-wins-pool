import { _ } from 'lodash';
import log from '../../../utils/log';
import { PoolGameInterestRatings } from '../pool_game_interest_ratings';

import { PoolTeams } from '../../pool_teams/pool_teams';
import { PoolTeamPicks } from '../../pool_team_picks/pool_team_picks';
import { LeagueTeams } from '../../league_teams/league_teams';

import TopPicks from './calculators/top-picks';

export default {
  calculate(pool, game) {
    PoolGameInterestRatings.remove({
      poolId: pool._id,
      gameId: game._id,
    });

    const gameTitle = this.gameTitle(pool, game);

    log.info('Calculating interest ratings for', gameTitle);

    this.calculators().forEach(calculator => {
      const rating = Math.round(calculator.rating(pool, game));

      PoolGameInterestRatings.insert({
        poolId: pool._id,
        gameId: game._id,
        rating,
        gameTitle,
        justification: calculator.justification(),
      });
    });
  },

  calculators() {
    return [
      TopPicks,
    ];
  },

  gameTitle(pool, game) {
    // "Noah's #6 NYG at Charlie's #8 GB"

    // see who picked these teams
    const homePoolTeamPick = PoolTeamPicks.findOne({
      seasonId: pool.latestSeasonId,
      poolId: pool._id,
      leagueTeamId: game.homeTeamId,
    });
    const awayPoolTeamPick = PoolTeamPicks.findOne({
      seasonId: pool.latestSeasonId,
      poolId: pool._id,
      leagueTeamId: game.awayTeamId,
    });

    if (!homePoolTeamPick || !awayPoolTeamPick) {
      throw new Error(`Both teams weren't picked for poolId ${pool._id} and gameId ${game._id}`);
    }

    const homePoolTeam = PoolTeams.findOne(homePoolTeamPick.poolTeamId);
    const awayPoolTeam = PoolTeams.findOne(awayPoolTeamPick.poolTeamId);

    const homeLeagueTeam = LeagueTeams.findOne(game.homeTeamId);
    const awayLeagueTeam = LeagueTeams.findOne(game.awayTeamId);

    const homeSummary = `${awayPoolTeam.userTeamName}'s #${awayPoolTeamPick.pickNumber} ${awayLeagueTeam.abbreviation}`;
    const awaySummary = `${homePoolTeam.userTeamName}'s #${homePoolTeamPick.pickNumber} ${homeLeagueTeam.abbreviation}`;

    return `${homeSummary} at ${awaySummary}`;
  },
};