Inch.js
=======

**DISCLAIMER: This is not real (yet).**

Wrapper for [Inch](http://trivelop.de/inch) for NodeJS.


## Ideas

Measuring documentation coverage is not an easy task, as my experience in developing Inch for Ruby has shown. I wanted to write down some ideas for Inch.js to see how they look on paper.

* Although there are standards like JSDoc, where comments are formatted in a specific way, Inch.js should recognize any kind of comment as inline-docs.
* Docs that only contain "TODO: ..." or "FIXME" are not sufficient documentation.
* But some docs are better than none, so in most cases a singleline comment will suffice and is therefore enough for a "not bad"-rating.
* If otherwise sufficient docs contain "TODO: ..." or "FIXME" this is considered fair-game and does not impact the evaluation.

If you want to contribute [open an issue](https://github.com/rrrene/inch.js/issues/new)!
