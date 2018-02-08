# babel-plugin-react-ssr

<a href="https://www.npmjs.com/package/babel-plugin-react-ssr">
  <img src="https://img.shields.io/npm/v/babel-plugin-react-ssr.svg" alt="npm version">
</a>
<a href="https://github.com/oayres/babel-plugin-react-ssr/blob/master/LICENSE.md">
  <img src="https://img.shields.io/npm/l/babel-plugin-react-ssr.svg" alt="license">
</a>
<a href="https://david-dm.org/oayres/babel-plugin-react-ssr">
  <img src="https://david-dm.org/oayres/babel-plugin-react-ssr/status.svg" alt="dependency status">
</a>
<a href="https://standardjs.com">
  <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide" />
</a>
<br>

## Overview

A babel plugin to do the hidden dirty work for react-ssr. You **must** currently use this plugin to acheive seamless server-side rendering, but you could probably manually do the steps this plugin does for you if you wish. This plugin will find every React component during transpilation and do the following:

- Add a static `_ssrWaitsFor` array

If the React component contains a `static fetchData` method, it will also:

- Wrap it in a HOC (higher order component)
- Add a static `_ssrProps` array

Read the example below if you'd like know why these hidden properties are added.

## Installation

```sh
$ npm install react-ssr --save
$ npm install babel-plugin-react-ssr --save-dev
```

## Usage

Chuck me straight in the `.babelrc` and you're *done*.

```json
{
  "plugins": ["react-ssr"]
}
```

## Example

Let's assume you have a page like this, with data calls you want to server-side render:

```jsx
import React, { Component } from 'react'
import MyComponent from './components/MyComponent'

class HomePage extends Component {
  static fetchData () {
    const myThing = new Promise((resolve, reject) => {
      fetch('/api')
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })

    return {
      title: someApiCallThatReturnsATitle(),
      thing: myThing
    }
  }

  render () {
    return (
      <div>
        Here's the title prop: {this.props.title}
        {this.props.thing}
        <MyComponent />
      </div>
    )
  }
}

export default HomePage
```

Let's also assume your `MyComponent` imported in that example also has a `static fetchData` method.

The plugin will detect the `HomePage` has a `static fetchData` method and therefore carry out its three tasks:

- Wrap it in a HOC (that comes from `react-ssr`)
```js
import ssrFetchData from 'react-ssr/lib/fetchData'
// the component code in between
export default ssrFetchData(HomePage)
```

- Add a static `_ssrWaitsFor`, populating it with `MyComponent` after detecting it also has a `static fetchData`
```js
HomePage._ssrWaitsFor = [
  MyComponent
]
```

- Add a static `_ssrProps`, with object keys of the `fetchData` return to be injected into `this.props`
```js
HomePage._ssrProps = [
  'title',
  'thing'
]
```

`react-ssr` can then:
- Use the HOC client-side to execute `fetchData` methods.
- Read the `_ssrWaitsFor` property before a server-side render to simulatenously call all `static fetchData` methods.
- Read the `_ssrProps` property inside the HOC client-side, in order to quickly check whether those props are already defined on the component. This provides it with a quick and performant way to know whether to call `fetchData` or not.
