const { execSync, execFileSync } = require('child_process');
require('dotenv').config();

function getConnectionInfo (env) {
  const { URI, PROTOCOL, HOST, PORT, DATABASE, USERNAME, PASSWORD } = env;

  if (URI) {
    const { protocol, username, password, hostname, port, pathname } = new URL(URI);

    return {
      protocol: protocol.replace(':', '').trim(),
      hostname,
      port,
      database: pathname?.substring(1),
      username,
      password
    };
  } else if (HOST && DATABASE && USERNAME && PASSWORD) {
    // PROTOCOL and PORT can be undefined
    return {
      protocol: PROTOCOL,
      hostname: HOST,
      port: PORT,
      database: DATABASE,
      username: USERNAME,
      password: PASSWORD
    };
  } else {
    console.error('not enough configuration provided');
    console.error(`URI: ${URI}, PROTOCOL: ${PROTOCOL}, HOST: ${HOST}, PORT:${PORT}, DATABASE: ${DATABASE}, USERNAME: ${USERNAME}, PASSWORD: ${PASSWORD}`);
    process.exit(1);
  }
}

function initiate () {
  const { protocol, hostname, port, database, username, password } = getConnectionInfo(process.env);
  try {
    execSync('rm -rf src/models dist');
    const args = ['node_modules/sequelize-auto/bin/sequelize-auto', '-o', './src/models', '-d', database, '-h', hostname, '-u', username, '-x', password, '-l', 'es6', '-a', '.sequelize-auto.config.json'];
    if (port) {
      args.push('-p', port);
    }
    if (protocol) {
      args.push('-e', protocol);
    }
    execFileSync('node', args);
    execSync('npx tsc --build');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

initiate();
