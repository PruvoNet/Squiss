# Squiss-TS Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## Development
### Added
- Optionally retain s3 blobs on message delete [#16](https://github.com/PruvoNet/squiss-ts/issues/16)
- Optionally set prefix for s3 blob names [#15](https://github.com/PruvoNet/squiss-ts/issues/15)

## [v1.4.0]
### Added
- Add ability to control SQS attributes returned and expose them in Message object [#4](https://github.com/PruvoNet/squiss-ts/issues/4)
- Option to auto gzip messages to reduce message sizes [#5](https://github.com/PruvoNet/squiss-ts/issues/5)
- Updated npm packages versions
- Add support to auto upload large messages to s3 [#6](https://github.com/PruvoNet/squiss-ts/issues/6) (same behaviour like [amazon-sqs-java-extended-client-lib](https://github.com/awslabs/amazon-sqs-java-extended-client-lib))
- Add support to define minimum message size to gzip when gzip feature is enabled [#9](https://github.com/PruvoNet/squiss-ts/issues/9)
### Fixed
- Batch message sending to handle FIFO message attributes properly
- Message properties parser to handle boolean values properly

## [v1.3.0]
### Added
- Expose method to check if message was handled
- If message extended time is finished, release the message slot, mark it as handled and emit `timeoutReached` event
- Message is now also event emitter, and all event related to a message will also be emitted on it
- Expose SQS typings for direct usage of the underlying SQS instance without adding it as a dependency to your project
- Allow to pass `MessageGroupId` and `MessageDeduplicationId` FIFO related parameters when sending a message
### Fixed
- Fix mocha test options

## [v1.2.4]
### Fixed
- Fix package.json to point to typing files

## [v1.2.3]
### Fixed
- Upgraded npm packages

## [v1.2.2]
### Fixed
- Upgraded linked-list version to avoid redundant typing files

## v1.2.1
### Fixed
- Upgraded mocha version to avoid security risks

## v1.2.0
### Added
- Support message deletion resolving with Promise

## v1.1.0
### Fixed
- After stop, don't pull any more messages
### Added
- Added support for customizing the requested message attributes
- Stop method now returns promise that will be resolved when queue drains or timeout passes

## v1.0.0
### Added
- Ported from [TomFrost/Squiss](https://www.github.com/TomFrost/Squiss) v2.2.1 (__no backward compatibility__)
- Complete rewrite in typescript
- Move to the newest AWS sdk (v2.418.0)
- Improve the performance by always filling the handled messages and not waiting for an entire batch size to be fetched
- Parse the message attributes into a plain object in send and receive of messages
- Added `purge queue` capability
- Revised the doubly linked list to be used by an external (and lean) library
- Deleting a message now returns a promise that will be fulfilled upon success.
- Batch messaging now supports attribute map per message

[v1.2.2]: https://github.com/PruvoNet/squiss-ts/compare/v1.2.1...v1.2.2
[v1.2.3]: https://github.com/PruvoNet/squiss-ts/compare/v1.2.2...v1.2.3
[v1.2.4]: https://github.com/PruvoNet/squiss-ts/compare/v1.2.3...v1.2.4
[v1.3.0]: https://github.com/PruvoNet/squiss-ts/compare/v1.2.4...v1.3.0
[v1.4.0]: https://github.com/PruvoNet/squiss-ts/compare/v1.3.0...v1.4.0
