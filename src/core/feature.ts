export type Disposer = () => void

export type FeatureInit = () => void | Disposer
