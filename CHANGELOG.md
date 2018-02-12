# Unreleased

- Add `prefix` option to prefix ids

# 0.4.2 -- April 5, 2017

- Remove unnecessary (and broken-in-Windows) check for absolute path on `this.outputPath` ([#31](https://github.com/svgstore/broccoli-svgstore/pull/31)).


# 0.4.1 -- January 9, 2017

- Fix incorrect behavior of setting `inline` to `true` when calling `svgOutput.toString()`


# 0.4.0 -- December 20, 2016

- Update to `svgstore` @ 2.x.
 + Supports passing options to the [new `svgstore` options API](https://github.com/svgstore/svgstore#options)
 that includes the ability to define mappings of custom `<symbol>`
 attributes and custom root `<svg>` attributes ([#24](https://github.com/svgstore/broccoli-svgstore/pull/24)).


# 0.3.1 -- September 13, 2016
- Update project licensing


# 0.3.0 -- September 13, 2016
- Add ability to set `svgstore` options on a per-file basis ([#16](https://github.com/svgstore/broccoli-svgstore/pull/16))


# 0.2.1 -- August 28, 2016
- Use `svgstore` implementation of svg-to-symbol conversion [#13](https://github.com/svgstore/broccoli-svgstore/pull/13)


# 0.2.0 -- August 03, 2016
- Replace `broccoli-writer` with `broccoli-caching-writer` and begin conforming to its API.
- Update miscellaneous deps from two-year old project.
- Set up an initial test harness for the project.


# 0.1.0
- Initial release
