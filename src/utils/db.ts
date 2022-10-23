import { Sequelize } from 'sequelize';
// @ts-ignore
import initModels from '../models/init-models';
import { Options } from 'sequelize/types/sequelize';

interface DatabaseURIConfig {
  uri: string
}
interface DatabasePasswordConfig {
  host: string
  database: string
  username: string
  password: string
}
export type DatabaseConfig = DatabaseURIConfig | DatabasePasswordConfig;

// TODO: add options to parameter if need further extensions
const defaultOptions: Options = {
  dialect: 'mysql',
  define: { underscored: true }
};

function isUriConfig (config: DatabaseConfig): config is DatabaseURIConfig {
  return 'uri' in config;
}

export async function prepareDatabase (
  config: DatabaseConfig,
  options?: Options
) {
  const dbOptions = { ...defaultOptions, ...options };

  try {
    let sequelize: Sequelize;
    if (isUriConfig(config)) {
      sequelize = new Sequelize(config.uri, dbOptions);
    } else {
      const { host, database, username, password } = config;
      sequelize = new Sequelize(database, username, password, {
        host,
        ...dbOptions
      });
    }

    const models = initModels(sequelize);
    await sequelize.sync();
    console.log('Database Connected');

    return models;
  } catch (err) {
    console.error('Database Connection Failed');
    console.error(err);

    throw err;
  }
}
