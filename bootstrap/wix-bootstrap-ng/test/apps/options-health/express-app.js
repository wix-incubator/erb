module.exports = (app, context) => {
  let healthTestInvocationCount = 0;
  context.management.addHealthTest('for-test', () => healthTestInvocationCount++);
  
  return app
    .get('/health-test-invocations', (req, res) => res.json({count: healthTestInvocationCount}));
};
