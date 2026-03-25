/**
 * user-activity router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/user-activities/track',
      handler: 'user-activity.track',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user-activities/recent-searches',
      handler: 'user-activity.getRecentSearches',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user-activities/recommendations',
      handler: 'user-activity.getRecommendations',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
