export default () => {
  // @ts-expect-error: assigned globally by start-and-publish-to-local-registry
  if (global.stopLocalRegistry) {
    // @ts-expect-error: assigned globally by start-and-publish-to-local-registry
    global.stopLocalRegistry();
  }
};
