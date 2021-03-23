'use strict';

import * as chai from 'chai';
// @ts-ignore
import * as dirtyChai from 'dirty-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
// @ts-ignore
import * as mod from 'module';
// @ts-ignore
import * as sinon from 'sinon';
// @ts-ignore
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(dirtyChai);

(global as any).should = chai.should();
(global as any).sinon = sinon;

// importing files with ../../../../../.. makes my brain hurt
process.env.NODE_PATH = path.join(__dirname, '..') + path.delimiter + (process.env.NODE_PATH || '');
// @ts-ignore
mod._initPaths();
