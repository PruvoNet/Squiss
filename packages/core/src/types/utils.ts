export type ReadonlyFlat<O> = {
    +readonly [K in keyof O]: O[K]
} & {};
