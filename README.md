# babel-plugin-react-cohere

A babel plugin to do the dirty work for react-cohere. Forms coherent routes that defines required data dependencies to allow for a declarative and simple approach to server side rendering in React.

## Installation

```sh
$ npm install babel-plugin-react-cohere
```

## Usage

### Via `.babelrc` (recommended)

**.babelrc**

```json
{
  "plugins": ["react-cohere"]
}
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["react-cohere"]
});
```

## Example

**In**

Let's assume you have a component performing a data call like so:

```js
import React, { Component } from 'react'

const someCall = () => {
  return new Promise((resolve, reject) => {
    fetch('/api')
      .then(res => response.json())
      .then(resolve)
      .catch(reject)
  })
}

class MyComponent extends Component {
  static fetchDataForProps () {
    return {
      title: someCall()
    }    
  }

  render () {
    return (
      <div>
        Hello from {this.props.title}!
      </div>
    )
  }
}

export default MyComponent
```

With a HomePage using the above component:

```js
import React, { Component } from 'react'
import MyComponent from './components/MyComponent'

class HomePage extends Component {
  render () {
    return (
      <div>
        Hello world.
        <MyComponent />
      </div>
    )
  }
}

export default HomePage
```

**Out**

babel-plugin-react-cohere will identify that it includes a component with a coherent data call, which complies with react-cohere's api, so it will add a property to be read during server render:

```js
HomePage.waitsFor = [
  MyComponent
]
```
