export const removeEmptyKeys = <T extends object>(obj: T): T => {
    (Object.keys(obj) as (keyof typeof obj)[]).forEach((key) => {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};

export const isFacadeConfig = <T>(x?: unknown): x is { facade: T } => {
    return Boolean(x && (x as any).facade);
}

export const buildLazyGetter = <A>(init: () => A) => {
    let product: A | undefined;
    return (): A => {
        if (product) {
            return product;
        }
        product = init();
        return product;
    }
}

export type Constructor<T, A> = new (arg: A) => T;

export const classGetter =
    <T, A, C extends Constructor<T, A> = Constructor<T, A>>
    (ctor: C, arg: A, clazz?: T | C): T => {
        if (clazz) {
            if (typeof clazz === 'function') {
                return new (clazz as Constructor<T, A>)(arg);
            } else {
                return clazz;
            }
        } else {
            return new ctor(arg);
        }
    }

export const buildLazyClassGetter =
    <T, A, C extends Constructor<T, A> = Constructor<T, A>>(ctor: C, arg: A, clazz?: T | C) => {
        return buildLazyGetter<T>(() => {
            return classGetter<T, A, C>(ctor, arg, clazz);
        });
    }
