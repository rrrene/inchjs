# InchJS

`inchjs` gives you hints where to improve your docs. One Inch at a time.

It is a wrapper for [Inch](http://trivelop.de/inch) for JavaScript. Take a look at the [original Inch page with screenshots (live and in full color)](http://rrrene.github.io/inch/).

## What can it do?

`inchjs` is a little bit like Code Climate, but for your inline code documentation (and not a webservice).

It is a command-line utility that suggests places in your codebase where documentation can be improved.

If there are no inline-docs yet, `inchjs` can tell you where to start.



## Installation

To install simply run:

    $ npm install inchjs



## Usage

To run Inch, simply type

    $ inchjs

Given a `lib` directory with the following code inside:

```javascript
// A complicated function
var complicated(o, i, args) = function {
  // ... snip ...
}

/**
 *  An example of a function that takes a parameter (+param1+)
 *  and does nothing.
 *
 *  Returns null
 */
var nothing(param1) = function {
  // ... snip ...
}

var filename = function {
  // ... snip ...
}
```

Inch will suggest that the docs could be improved:

    # Properly documented, could be improved:

    ┃  B  ↑  complicated
    ┃  B  ↑  nothing

    # Undocumented:

    ┃  U  ↗  filename

    You might want to look at these files:

    ┃ src/something.js

    Grade distribution (undocumented, C, B, A):  █  ▁ ▄ ▄

    Only considering priority objects: ↑ ↗ →  (use `--help` for options).


If you have Inch installed it will run locally. If not, it will use the API of [inch-ci.org](http://inch-ci.org/) to display results. If you want to specify a certain Inch version you have installed (e.g. for testing), you can set the `INCH_PATH` environment variable.


## Configuration

By default, InchJS looks into `{lib,src}/**/*.js` for JavaScript source files. You can customize this by either passing the desired files to the executable:

    $ inchjs suggest plugins/**/*.js

or by creating a file named `inch.json` in your project directory:

```json
{
  "files": {
    "included": [
      "plugins/**/*.js"
    ],
    "excluded": [
      "plugins/vendor/sparkr/sparkr.js",
      "plugins/vendor/**/*.js",
      "!regexp:/vendor/"
    ]
  }
}
```

As you would expect, `included` sets an array of included files (or globs) and `excluded` sets an array of files, globs or regexes of files to exclude from the evaluation.


## Philosophy

Inch was created to help people document their code, therefore it may be more important to look at **what it does not** do than at what it does.

* It does not aim for "fully documented" or "100% documentation coverage".
* It does not tell you to document all your code (neither does it tell you not to).
* It does not impose rules on how your documentation should look like.
* It does not require that, e.g."every function's documentation should be a single line under 80 characters not ending in a period" or that "every class and module should provide a code example of their usage".

Inch takes a more relaxed approach towards documentation measurement and tries to show you places where your codebase *could* use more documentation.



### The Grade System

Inch assigns grades to each class, module, constant or function in a codebase, based on how complete the docs are.

The grades are:

* `A` - Seems really good
* `B` - Properly documented, but could be improved
* `C` - Needs work
* `U` - Undocumented

Using this system has some advantages compared to plain coverage scores:

* You can get an `A` even if you "only" get 90 out of 100 possible points.
* Getting a `B` is basically good enough.
* Undocumented objects are assigned a special grade, instead of scoring 0%.

The last point might be the most important one: If objects are undocumented, there is nothing to evaluate. Therefore you can not simply give them a bad rating, because they might be left undocumented intentionally.



### Priorities ↑ ↓

Every module, constant and function in a codebase is assigned a priority which reflects how important Inch thinks it is to be documented.

This process follows some reasonable rules, like

* it is more important to document public functions than private ones
* it is more important to document functions with many parameters than functions without parameters
* it is not important to document objects marked as `@private`

Priorities are displayed as arrows. Arrows pointing north mark high priority objects, arrows pointing south mark low priority objects.



### No overall scores or grades

Inch does not give you a grade for your whole codebase.

"Why?" you might ask. Look at the example below:

    Grade distribution (undocumented, C, B, A):  ▄  ▁ ▄ █

In this example there is a part of code that is still undocumented, but
the vast majority of code is rated A or B.

This tells you three things:

* There is a significant amount of documentation present.
* The present documentation seems good.
* There are still undocumented functions.

Inch does not really tell you what to do from here. It suggests objects and
files that could be improved to get a better rating, but that is all. This
way, it is perfectly reasonable to leave parts of your codebase
undocumented.

Instead of reporting

    coverage: 67.1%  46 ouf of 140 checks failed

and leaving you with a bad feeling, Inch tells you there are still
undocumented objects without judging.

This provides a lot more insight than an overall grade could, because an overall grade for the above example would either be an `A` (if the evaluation ignores undocumented objects) or a weak `C` (if the evaluation includes them).

The grade distribution does a much better job of painting the bigger picture.



## Features

Inch is build to parse [JSDoc](http://usejsdoc.org/),
[AtomDoc](https://github.com/atom/atomdoc) and [TomDoc](http://tomdoc.org/)
style documentation comments, but works reasonably well with unstructured
comments.

These inline-docs below all score an `A` despite being written in different styles:

```javascript
/**
 *  Detects the size of the blob.
 *
 *  @example
 *    getBlobSize(filename, blob)  *  => some value
 *
 *  @param filename {String} the filename
 *  @param blob {String} the blob data
 *  @param mode {String, null} optional String mode
 *  @return {Number, null}
 */
var getBlobSize = function(filename, blob, mode) { }
```

```javascript
/**
 *  Public: Detects the size of the blob.
 *
 *  * `count` {Number} representing count
 *
 *  * `filename` {String} the filename
 *  * `blob` {String} the blob data
 *  * `mode` {String,null} optional String mode
 *
 *  ## Example
 *
 *    getBlobSize(filename, blob)  *  => some value
 *
 *  Returns Number or null.
 */
var getBlobSize = function(filename, blob, mode) { }
```

```javascript
// Public: Detects the size of the blob.
//
// filename - String filename
// blob - String blob data
// mode - Optional String mode (defaults to null)
//
// Examples
//
//   getBlobSize(filename, blob)
//   // => some value
//
// Returns Number or null.
var getBlobSize = function(filename, blob, mode) { }
```

But you don't have to adhere to any specific syntax. This gets an `A` as well:

```javascript
// Returns the size of a +blob+ for a given +filename+ (+mode+ is optional).
//
//   getBlobSize(filename, blob)
//   // => some value
//
var getBlobSize = function(filename, blob, mode = null)
```

Inch *let's you write your documentation the way you want*.


## Subcommands

It comes with four sub-commands: `suggest`, `stats`, `show`, and `list`


### inchjs suggest

Suggests places where a codebase suffers a lack of documentation.

    $ inchjs suggest

    # Properly documented, could be improved:

    ┃  B  ↑  BaseList#prepare_list
    ┃  B  ↑  FunctionParameterObject#initialize
    ┃  B  ↗  Stats#run
    ┃  B  ↗  CommandParser#run

    # Not properly documented:

    ┃  C  ↑  NodocHelper#implicit_nodoc_comment?
    ┃  C  ↑  Suggest#initialize
    ┃  C  ↑  Suggest#initialize

    # Undocumented:

    ┃  U  ↑  ConstantObject#evaluate
    ┃  U  ↑  FunctionObject#evaluate
    ┃  U  ↑  SourceParser#find_object

    You might want to look at these files:

    ┃ src/code_object/proxy/base.js
    ┃ src/code_object/proxy/function_object.js
    ┃ src/evaluation/role/object.js

    Grade distribution (undocumented, C, B, A):  █  ▃ ▁ ▄

    Only considering priority objects: ↑ ↗ →  (use `--help` for options).



### inchjs stats

Shows you an overview of the codebase.

    $ inchjs stats

    Grade distribution: (undocumented, C, B, A)

      Overall:  █  ▂ ▁ ▃    439 objects

    Grade distribution by priority:

            ↑   ▁  ▄ █ ▁     10 objects

            ↗   █  ▃ ▁ ▃    302 objects

            →   ▆  ▂ ▁ █     73 objects

            ↘   █  ▁ ▁ ▁     54 objects

            ↓   ▁  ▁ ▁ ▁      0 objects

    Priority distribution in grades: (low to high)

          ↓      ↘      →      ↗      ↑
      U:  ▁ ▁ ▁ ▁ ▁ ▁ ▂ ▂ ▁ █ ▁ ▁ ▁ ▁ ▁   243 objects

      C:  ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ █ ▁ ▁ ▁ ▁ ▁    73 objects

      B:  ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▁ █ ▂ ▄ ▁ ▁ ▁    19 objects

      A:  ▁ ▁ ▁ ▁ ▁ ▁ ▁ ▄ ▁ █ ▁ ▁ ▁ ▁ ▁   104 objects


    Try `--format json|yaml` for raw numbers.



### inchjs list

Lists all objects in your codebase with their grades.

    $ inchjs list

    # Seems really good

    ┃  A  ↑  Console#object
    ┃  A  ↗  Proxy#depth
    ┃  A  ↗  Base#description
    ┃  A  ↗  NodocHelper#nodoc?
    ┃ ...  (omitting 75 objects)

    # Proper documentation present

    ┃  B  ↑  Suggest#run
    ┃  B  ↑  FunctionParameterObject#initialize
    ┃  B  ↗  Stats#run
    ┃  B  ↗  CommandParser#run

    # Needs work

    ┃  C  ↑  NodocHelper#implicit_nodoc_comment
    ┃  C  ↑  Console#initialize
    ┃  C  ↑  ConstantObject#evaluate
    ┃  C  ↑  SourceParser#find_object
    ┃ ...  (omitting 248 objects)

    This output omitted 323 objects. Use `--all` to display all objects.




## Limitations

How you document your code is up to you and Inch can't actually tell you how good your docs are.

It can't tell if your code examples work or if you described parameters
correctly or if you have just added `# TODO: write docs` to each and every
function.

It is just a tool, that you can use to find parts in your codebase that are
lacking documentation.



## How is this different from ...?

### Documentation coverage

Documentation coverage checks look at all code objects and
determine if the found documentation meets a certain threshold/expectation.

Inch takes a different approach as it aims for "properly documented" rather
than "100% coverage".



## Ideas

Measuring documentation coverage is not an easy task, as my experience in developing Inch for Ruby has shown. I wanted to write down some ideas for InchJS to see how they look on paper.

* Although there are standards like JSDoc, where comments are formatted in a specific way, InchJS should recognize any kind of comment as inline-docs.
* Docs that only contain "TODO: ..." or "FIXME" are not sufficient documentation.
* But some docs are better than none, so in most cases a singleline comment will suffice and is therefore enough for a "not bad"-rating.
* If otherwise sufficient docs contain "TODO: ..." or "FIXME" this is considered fair-game and does not impact the evaluation.

If you want to contribute to this list [open an issue](https://github.com/rrrene/inchjs/issues/new)!




## Contributing

1. [Fork it!](http://github.com/rrrene/inchjs/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request



## Author

René Föhring (@rrrene)




## License

InchJS is released under the MIT License. See the LICENSE.txt file for further
details.
