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

A babel plugin to remove the need to declare ssrWaitsFor array and the ssrFetchData HOC on any component. This plugin will find every consumed React component during transpilation and do the following:
- Add a static `ssrWaitsFor` array

If the React component contains a `static fetchData` method, it will also:
- Add an import and wrap the component in a HOC (higher order component)

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
import Test from './components/Test'

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

  renderTest () {
    return <Test />
  }

  render () {
    return (
      <div>
        Here's the title prop: {this.props.title}
        {this.props.thing}
        <MyComponent />
        {this.renderTest()}
      </div>
    )
  }
}

export default HomePage
```

The babel plugin will:

- Add a static `ssrWaitsFor`, populating it with `MyComponent` and `Test`
```js
HomePage.ssrWaitsFor = [
  MyComponent,
  Test
]
```

The plugin will detect the `HomePage` has a `static fetchData` method and therefore:

- Wrap it in a HOC (that comes from `react-ssr`)
```js
import ssrFetchData from 'react-ssr/lib/fetchData'
// the component code in between
export default ssrFetchData(HomePage)
```

`react-ssr` can then:
- Use the HOC client-side to execute `fetchData` methods.
- Read the `ssrWaitsFor` property before a server-side render to simulatenously call all `static fetchData` methods required for the matched route.
