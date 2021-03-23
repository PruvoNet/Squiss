
import {getMessageSize} from '../../utils/messageSizeUtils';

describe('message size utils', () => {

  it('should get message size with no attributes', () => {
    getMessageSize({
      MessageBody: 'sss',
    }).should.eql(3);
  });

  it('should get message size with attributes', () => {
    getMessageSize({
      MessageBody: 'sss',
      MessageAttributes: {
        a: {
          StringValue: 'b',
          DataType: 'String',
        },
      },
    }).should.eql(11);
  });

  it('should get message size with attributes and not count non enumerable values', () => {
    function DummyConstructor() {
      // @ts-ignore
      this.a = {
        StringValue: 'b',
        DataType: 'String',
      };
    }

    DummyConstructor.prototype.pAttr = 1;
    // @ts-ignore
    const attributes: any = new DummyConstructor();
    getMessageSize({
      MessageBody: 'sss',
      // tslint-disable-next-line
      MessageAttributes: attributes,
    }).should.eql(11);
  });

});
