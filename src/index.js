import ClassDeclaration from './visitor/classDeclaration'

const transform = babel => {
  const t = babel.types

  return {
    visitor: {
      ClassDeclaration: ClassDeclaration.bind(null, babel),

      ExportDefaultDeclaration (path, { file }) {
        // if (!path.get('declaration').isClassDeclaration()) return
        if (!file.get('hasJSX') || file.get(path.node.declaration.name) || path.node.declaration.name === '_default') return

        const {node} = path
        const ref = node.declaration.id || path.scope.generateUidIdentifier('default')
        const waitsFor = file.get('_ssrWaitsFor')
        const hasFetchData = file.get('hasFetchData')

        if ((waitsFor || hasFetchData) && typeof node.declaration.name === 'undefined') {
          console.info(node.declaration)
          throw new Error(`

            react-ssr found an export default that was not exporting with a plain variable, instead found ${node.declaration.type}.
            Assign that to a variable and export that variable as default.

          `)
        }

        if (waitsFor) {
          const waitsForIdentifiers = waitsFor.map(waiter => t.identifier(waiter))
          const _ssrWaitsFor = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(node.declaration.name), t.identifier('_ssrWaitsFor')),
            t.arrayExpression(waitsForIdentifiers)
          )
  
          path.insertBefore(_ssrWaitsFor)
        }

        if (hasFetchData) {
          const decorator = t.variableDeclaration('var', [
            t.variableDeclarator(ref,
              t.callExpression(
                t.identifier('ssrFetchData'),
                node.declaration.arguments || [node.declaration]
              )
            )
          ])
  
          const displayName = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(node.declaration.name), t.identifier('displayName')),
            t.stringLiteral(node.declaration.name)
          )

          path.insertBefore(displayName)
          path.replaceWith(decorator)
          file.set(node.declaration.name, true)
          path.insertAfter(t.exportDefaultDeclaration(ref))
        }
      },

      JSXOpeningElement (path, { file }) {
        file.set('hasJSX', true)
        const element = path.node.name
        const isNotDOMElement = element.name !== element.name.toLowerCase()

        if (isNotDOMElement) {
          const waitsFor = file.get('_ssrWaitsFor') || []
          const component = element.name

          if (!waitsFor.includes(component)) {
            waitsFor.push(component)
          }

          file.set('_ssrWaitsFor', waitsFor)
        }
      },

      ExpressionStatement (path, { file }) {
        const { type, left = {}, right = {} } = path.node.expression || {}
        const isAssignment = type === 'AssignmentExpression'

        if (isAssignment) {
          const leftIsMember = left.type === 'MemberExpression'
          const rightIsFunction = right.type === 'FunctionExpression' || right.type === 'ArrowFunctionExpression'

          if (leftIsMember && rightIsFunction) {
            const { name } = left.property || {}
            
            if (name === 'fetchData') {
              file.set('hasFetchData', true)
            }
          }
        }
      },

      Program: {
        enter(path, { file }) {
          file.set('hasJSX', false)
        },

        exit(path, { file }) {
          const { node, scope } = path

          if (!file.get('hasFetchData')) {
            return
          }

          if (!(file.get('hasJSX') && !scope.hasBinding('ssrFetchData'))) {
            return
          }

          // some way of checking if react-ssr fetchData import exists
          // or even require...
          // console.info('Bindings: ', scope.getAllBindings())

          const ssrImport = t.importDeclaration([
            t.importDefaultSpecifier(t.identifier('ssrFetchData')),
          ], t.stringLiteral('react-ssr/lib/fetchData'))

          node.body.unshift(ssrImport)
        }
      }
    }
  }
}

export default transform
