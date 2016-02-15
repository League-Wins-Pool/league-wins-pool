Template.poolsHeader.helpers({
  title: () => {
    const name = _.get(Template.instance().getPool(), 'name');
    const year = Template.instance().seasonYear();
    if (year) return `${year} ${name}`;
    return name;
  },
});

Template.poolsHeader.onCreated(function() {
  new SimpleSchema({
    poolId: { type: String },
    seasonId: { type: String, optional: true },
  }).validate(Template.currentData());

  this.getPoolId = () => this.data.poolId;

  this.getPool = () => Pools.findOne(this.getPoolId());

  this.getSeasonId = () => this.data.seasonId;

  this.seasonYear = () => {
    if (! this.getSeasonId()) return null;

    return _.get(Seasons.findOne(this.getSeasonId()), 'year');
  };

  this.autorun(() => {
    this.subscribe('pools.single', this.getPoolId(), () => {
      log.debug(`header: pools.single subscription ready: ${Pools.find(this.getPoolId()).count()}`);
      if (Pools.find(this.getPoolId()).count() === 0) FlowRouter.go('/');
    });

    this.subscribe('seasons.single', this.getSeasonId(), () => {
      log.debug(`header: seasons.single ready`);
    });
  });
});