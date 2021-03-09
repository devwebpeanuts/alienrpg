export default function () {
  game.settings.register('alienrpg-improved-ui', 'defaultTokenSettings', {
    name: 'ALIENRPG.DefProto',
    hint: 'ALIENRPG.DefProtoHint',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register('alienrpg-improved-ui', 'systemMigrationVersion', {
    name: 'System Migration Version',
    scope: 'world',
    config: false,
    type: String,
    default: 0,
  });

  game.settings.register('alienrpg-improved-ui', 'switchMouseKeys', {
    name: 'ALIENRPG.SwitchKeys',
    hint: 'ALIENRPG.SwitchKeysHint',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true,
    onChange: () => {
      location.reload();
    },
  });
}
