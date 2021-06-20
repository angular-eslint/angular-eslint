import {
  cleanUp,
  publishPackagesToVerdaccio,
  spawnLocalRegistry,
} from './utils/local-registry-process';

(async () => {
  try {
    await spawnLocalRegistry();
    await publishPackagesToVerdaccio();
  } catch (e) {
    console.log(e);
    cleanUp(1);
  }
})();
