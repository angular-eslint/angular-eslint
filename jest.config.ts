// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getJestProjectsAsync } = require('@nx/jest');

export default async () => ({ projects: await getJestProjectsAsync() });
