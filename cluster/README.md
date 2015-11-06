# cluster

Cluster represents a set of modules that enables you to run an app in a [clustered](https://nodejs.org/api/cluster.html) environment.

See [wix-cluster](wix-cluster) for main benefits and usage, where in addition you have:
 - [wix-management-app](wix-management-app) that provides you with basic contract with ops (is_alive, deployment/test) and basic app-info functionality.
 - [wix-cluster-exchange](wix-cluster-exchange) - communication medium within cluster. Given master and workers are different processes, only way to communicate is via ipc, so `wix-cluster-exchange` gives you a topic-based communication within cluster.
 - [wix-cluster-testkit](wix-cluster-testkit) - testkit for running apps in a clustered environment. Inteded for [cluster plugin](wix-cluster/lib/plugins) development or other use cases where you need to test app in partial [wix-cluster](wix-cluster) set-up.