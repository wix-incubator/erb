# cluster

Cluster represents a set of modules that enables you to run an app in a [clustered](https://nodejs.org/api/cluster.html) environment.

See [wix-cluster](wix-cluster) for main benefits and usage, where in addition you have:
  - [wix-app-info](wix-app-info) - app console that can be plugged in to [wix-management-app](wix-management-app) and serves basic info about app (versions, stats, env...);
  - [wix-cluster-client](wix-cluster-client) - client for getting cluster-wide stats that works seamlessly if used both within `wix-cluster` or in a non-clustered mode.