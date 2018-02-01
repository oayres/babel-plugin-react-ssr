# babel-plugin-react-ssr

A babel plugin to do the hidden dirty work for react-ssr. It is _strongly advised_ you use this babel plugin alongside `react-ssr` to acheive seamless server-side rendering.

This babel plugin will find all of your React components with `static fetchData` methods and do the following things to them:

- Wrap it in a HOC (higher order component), which will call the `fetchData` methods during client-side rendering
- Add a static `_ssrWaitsFor` array, containing children components that also require `static fetchData`, which will speed up server-side rendering
- Add a static `_ssrProps` array, containing the keys from the object you've returned in your `fetchData` for the current component it is processing, which will speed up client-side rendering

## Installation

```sh
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

The babel plugin will detect the `HomePage` has a `static fetchData` method and therefore carry out its three tasks:

- Wrap it in a HOC
```js
export default _cohere(HomePage)
```

- Add a static `_ssrWaitsFor`, detecting that a child component `MyComponent` also as a `static fetchData`
```js
HomePage._ssrWaitsFor = [
  MyComponent
]
```

- Add a static `_ssrProps`
```js
HomePage._ssrProps = [
  'title',
  'thing'
]
```

`react-ssr` can then:
- Use the HOC client-side to execute `fetchData` methods.
- Read the `_ssrWaitsFor` property before a server-side render to simulatenously call all `static fetchData` methods.
- Read the `_ssrProps` property inside the HOC client-side, in order to quickly detect whether those props are already defined on the component. This provides it with a quick and performant way to know whether to call `fetchData` or not.
