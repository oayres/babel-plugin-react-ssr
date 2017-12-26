import classHasRenderMethod from '../helpers/classHasRenderMethod'
import assignWaitsForProperty from '../helpers/assignWaitsForProperty'

const classDeclaration = (babel, path, state) => {
  if (classHasRenderMethod(path)) {
    const body = path.node.body.body || []
    const waitsFor = []

    body.forEach(propertyOrMethod => {
      if (propertyOrMethod.type === 'ClassMethod' && propertyOrMethod.key.name === 'render') {
        const subBody = propertyOrMethod.body.body

        if (subBody) {
          const returnStatements = subBody.filter(({type}) => type === 'ReturnStatement')

          if (returnStatements && returnStatements.length) {
            returnStatements.forEach(statement => {
              if (statement.argument.type === 'JSXElement' && statement.argument.children && statement.argument.children.length) {
                statement.argument.children.forEach(child => {
                  if (child.type === 'JSXElement' && child.openingElement) {
                    const element = child.openingElement.name
                    const isJSX = element.type === 'JSXIdentifier'
                    const isNotDOMElement = element.name !== element.name.toLowerCase()

                    if (isJSX && isNotDOMElement) {
                      waitsFor.push(child)
                    }
                  }
                })
              }
            })
          }
        }
      }
    })

    assignWaitsForProperty(path, path.node.id, babel.types, waitsFor)
  }
}

export default classDeclaration
