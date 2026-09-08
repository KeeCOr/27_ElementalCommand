module.exports = {
  appId: 'com.keecor.elementalcommand',
  productName: 'Elemental Command',
  directories: { output: 'release' },
  files: [
    'electron/**/*',
    'dist/**/*',
    'steam_appid.txt',
  ],
  win: {
    target: ['nsis', 'portable'],
    signAndEditExecutable: false,
  },
  nsis: {
    artifactName: 'ElementalCommand_v${version}_setup.exe',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  portable: {
    artifactName: 'ElementalCommand_v${version}_portable.exe',
  },
};
