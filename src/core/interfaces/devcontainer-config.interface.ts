export interface DevContainerConfig {
  enabled: boolean;
  includeMongoDB: boolean;
  mongoReplicaSet: boolean;  // Only relevant if includeMongoDB is true
}
