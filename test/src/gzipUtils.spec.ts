'use strict';

import {decompressMessage, compressMessage} from '../../dist/gzipUtils';

describe('gzipUtils', () => {

  it('should compress message', () => {
    return compressMessage('{"i": 1}')
      .then((gzipped) => {
        gzipped.should.eql('iwOAeyJpIjogMX0D');
      });
  });

  it('should decompress message', () => {
    return decompressMessage('iwOAeyJpIjogMX0D')
      .then((parsed) => {
        parsed.should.eql('{"i": 1}');
      });
  });

  it('compressed and decompressed valued should be equal', () => {
    const message = '{"i": 1}';
    return compressMessage(message)
      .then((gzipped) => {
        return decompressMessage(gzipped);
      })
      .then((parsed) => {
        parsed.should.eql(message);
      });
  });
});
