
// https://github.com/bterlson/strict-event-emitter-types

declare const assignmentCompatibilityHack: unique symbol;

interface TypeRecord<T, U, V> {
    ' _emitterType'?: T;
    ' _eventsType'?: U;
    ' _emitType'?: V;
}

type InnerEEMethodReturnType<T, TValue, FValue> = T extends (
    ...args: any[]
    ) => any
    ? ReturnType<T> extends void | undefined ? FValue : TValue
    : FValue;

type EEMethodReturnType<
    T,
    S extends string,
    TValue,
    FValue = void
    > = S extends keyof T ? InnerEEMethodReturnType<T[S], TValue, FValue> : FValue;

type ListenerType<T> = [T] extends [(...args: infer U) => any]
    ? U
    : [T] extends [void] ? [] : [T];

interface OverriddenMethods<
    TEmitter,
    TEventRecord,
    TEmitRecord = TEventRecord
    > {
    on<P extends keyof TEventRecord, T>(
        this: T,
        event: P,
        listener: (...args: ListenerType<TEventRecord[P]>) => void
    ): EEMethodReturnType<TEmitter, 'on', T>;
    on(
        event: typeof assignmentCompatibilityHack,
        listener: (...args: any[]) => any
    ): void;

    addListener<P extends keyof TEventRecord, T>(
        this: T,
        event: P,
        listener: (...args: ListenerType<TEventRecord[P]>) => void
    ): EEMethodReturnType<TEmitter, 'addListener', T>;
    addListener(
        event: typeof assignmentCompatibilityHack,
        listener: (...args: any[]) => any
    ): void;

    addEventListener<P extends keyof TEventRecord, T>(
        this: T,
        event: P,
        listener: (...args: ListenerType<TEventRecord[P]>) => void
    ): EEMethodReturnType<TEmitter, 'addEventListener', T>;
    addEventListener(
        event: typeof assignmentCompatibilityHack,
        listener: (...args: any[]) => any
    ): void;

    removeListener<P extends keyof TEventRecord, T>(
        this: T,
        event: P,
        listener: (...args: any[]) => any
    ): EEMethodReturnType<TEmitter, 'removeListener', T>;
    removeListener(
        event: typeof assignmentCompatibilityHack,
        listener: (...args: any[]) => any
    ): void;

    removeEventListener<P extends keyof TEventRecord, T>(
        this: T,
        event: P,
        listener: (...args: any[]) => any
    ): EEMethodReturnType<TEmitter, 'removeEventListener', T>;
    removeEventListener(
        event: typeof assignmentCompatibilityHack,
        listener: (...args: any[]) => any
    ): void;

    once<P extends keyof TEventRecord, T>(
        this: T,
        event: P,
        listener: (...args: ListenerType<TEventRecord[P]>) => void
    ): EEMethodReturnType<TEmitter, 'once', T>;
    once(
        event: typeof assignmentCompatibilityHack,
        listener: (...args: any[]) => any
    ): void;

    emit<P extends keyof TEmitRecord, T>(
        this: T,
        event: P,
        ...args: ListenerType<TEmitRecord[P]>
    ): EEMethodReturnType<TEmitter, 'emit', T>;
    emit(event: typeof assignmentCompatibilityHack, ...args: any[]): void;
}

type OverriddenKeys = keyof OverriddenMethods<any, any, any>;

export type StrictEventEmitter<
    TEmitterType,
    TEventRecord,
    TEmitRecord = TEventRecord,
    UnneededMethods extends Exclude<OverriddenKeys, keyof TEmitterType> = Exclude<
        OverriddenKeys,
        keyof TEmitterType
        >,
    NeededMethods extends Exclude<OverriddenKeys, UnneededMethods> = Exclude<
        OverriddenKeys,
        UnneededMethods
        >
    > =
    TypeRecord<TEmitterType, TEventRecord, TEmitRecord> &
    Pick<TEmitterType, Exclude<keyof TEmitterType, OverriddenKeys>> &
    Pick<
        OverriddenMethods<TEmitterType, TEventRecord, TEmitRecord>,
        NeededMethods
        >;
