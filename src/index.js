import ClassDeclaration from './visitor/classDeclaration'

const transform = babel => {
  const t = babel.types

  return {
    visitor: {
      ClassDeclaration: ClassDeclaration.bind(null, babel),

      ExportDefaultDeclaration (path, { file }) {
        // if (!path.get('declaration').isClassDeclaration()) return
        if (!file.get('hasFetchData') || file.get(path.node.declaration.name) || path.node.declaration.name === '_default') return

        const {node} = path
        const ref = node.declaration.id || path.scope.generateUidIdentifier('default')

        const decorator = t.variableDeclaration('var', [
          t.variableDeclarator(ref, 
            t.callExpression(
              t.identifier('ssrFetchData'),
              [node.declaration]
            )
          )
        ])

        path.replaceWith(decorator)

        file.set(node.declaration.name, true)
        path.insertAfter(t.exportDefaultDeclaration(ref))
      },

      JSXOpeningElement (path, { file }) {
        file.set('hasJSX', true)
      },

      Program: {
        enter(path, { file }) {
          file.set('hasJSX', false)
        },

        exit({ node, scope }, { file }) {
          if (!file.get('hasFetchData')) {
            return
          }

          if (!(file.get('hasJSX') && !scope.hasBinding('ssrFetchData'))) {
            return
          }

          const cohereImport = t.importDeclaration([
            t.importDefaultSpecifier(t.identifier('ssrFetchData')),
          ], t.stringLiteral('react-ssr/lib/fetchData'))

          node.body.unshift(cohereImport)
        }
      }
    }
  }
}

export default transform
