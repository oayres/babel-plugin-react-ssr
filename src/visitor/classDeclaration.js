import classHasRenderMethod from '../helpers/classHasRenderMethod'
import assignStaticArray from '../helpers/assignStaticArray'

const injectIfJSXElement = (child, waitsFor = []) => {
  if (child.type === 'JSXElement' && child.openingElement) {
    const element = child.openingElement.name
    const isJSX = element.type === 'JSXIdentifier'
    const isNotDOMElement = element.name !== element.name.toLowerCase()

    if (isJSX && isNotDOMElement) {
      waitsFor.push(child)
    }
  }

  return waitsFor
}

const extractComponents = (waitsFor, propertyOrMethod) => {
  console.info('Got a property or method: ', propertyOrMethod)
  const subBody = propertyOrMethod.body.body

  if (subBody) {
    const returnStatements = subBody.filter(({type}) => type === 'ReturnStatement')

    if (returnStatements && returnStatements.length) {
      returnStatements.forEach(statement => {
        if (statement.argument.type === 'JSXElement' && statement.argument.children && statement.argument.children.length) {
          statement.argument.children.forEach(child => {
            waitsFor = injectIfJSXElement(child, waitsFor)
          })
        }
      })
    }
  }

  return waitsFor
}

const extractPropsForServerRender = (babel, propsForServerRender, propertyOrMethod) => {
  const { body = [] } = propertyOrMethod.body

  body.forEach((statement = {}) => {
    if (statement && statement.argument && statement.argument.properties) {
      statement.argument.properties.forEach(property => {
        if (property) {
          const name = property.key ? property.key.name : null

          if (name) {
            propsForServerRender.push(babel.types.stringLiteral(name))
          }
        }
      })
    }
  })

  return propsForServerRender
}

const classDeclaration = (babel, path, state) => {
  if (classHasRenderMethod(path)) {
    const body = path.node.body.body || []
    let waitsFor = []
    let propsForServerRender = []

    body.forEach(propertyOrMethod => {
      if (propertyOrMethod.static && propertyOrMethod.key.name === 'fetchData') {
        state.file.set('hasFetchData', true)
        propsForServerRender = extractPropsForServerRender(babel, propsForServerRender, propertyOrMethod)
      }

      if (propertyOrMethod.type === 'ClassMethod') {
        waitsFor = extractComponents(waitsFor, propertyOrMethod)
      }
    })

    assignStaticArray(path.get('body'), babel.types, '_ssrProps', propsForServerRender)
    // console.info('The waitsFor property: ', waitsFor)
    // assignStaticArray(path.get('body'), babel.types, '_ssrWaitsFor', waitsFor)
  }
}

export default classDeclaration
