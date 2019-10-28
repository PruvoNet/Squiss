'use strict';

export const removeEmptyKeys = <T extends object>(obj: T): T => {
    (Object.keys(obj) as Array<keyof typeof obj>).forEach((key) => {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};