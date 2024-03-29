import { Server } from '@hapi/hapi';
import { common } from './config';
import plugins from './plugins';

const registerAllPlugins = async ({ server, plugins }) => {
  //Register all configured plugins
  return Promise.all(plugins.map((exec) => exec(server)));
};

export const init = async (plugins = []) => {
  const server = new Server({
    port: common.port,
    host: common.host,
    router: {
      stripTrailingSlash: true,
      isCaseSensitive: true,
    },
  });
  await registerAllPlugins({
    server,
    plugins,
  });
  await server.initialize();
  return server;
};

export const run = async ({ container }) => {
  const server = await init(plugins);

  server.decorate('request', 'container', (name) => container.get(name));
  const bull = container.get('Queue');
  bull.process((payload) => {
    console.log('esta llegando la data', payload);
  });
  await server.start();
};
