/**
 * Equivalent of `async` package's `async.each`.
 *
 * @url https://github.com/caolan/async/tree/v1.5.2#eacharr-iterator-callback
 */
export default function each(arr, iterator, cb) {
  let processed = 0;
  let errors = 0;

  arr.forEach(function (item) {
    iterator(item, function (itemErr) {
      processed += 1;

      if (itemErr) {
        errors += 1;
        cb(itemErr);
      }

      // check if all items processed successfully
      if (
        processed === arr.length &&
        errors === 0
      ) {
        cb(null);
      }
    });
  });
}
