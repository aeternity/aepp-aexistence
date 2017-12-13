module.exports = {
  NODE_ENV: '"production"',
  IS_STAGE: process.env.TRAVIS_BRANCH === 'stage',
  SKIP_SECURITY: process.env.TRAVIS_BRANCH === 'stage' ? true : false
}
