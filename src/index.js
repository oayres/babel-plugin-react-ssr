import ClassDeclaration from './visitor/classDeclaration'
import setDisplayNameAfter from './helpers/setDisplayNameAfter'

const transform = babel => {
  const t = babel.types

  return {
    visitor: {
      ClassDeclaration: ClassDeclaration.bind(null, babel),

      ExportDefaultDeclaration (path, { file }) {
        // if (!path.get('declaration').isClassDeclaration()) return
        if (!file.get('hasJSX') || file.get(path.node.declaration.name) || path.node.declaration.name === '_default') return

        const { node, scope } = path
        const ref = node.declaration.id || path.scope.generateUidIdentifier('default')
        const waitsFor = file.get('ssrWaitsFor')
        const hasFetchData = file.get('hasFetchData')

        if ((waitsFor || hasFetchData) && typeof node.declaration.name === 'undefined') {
          throw new Error(`

            react-ssr found an export default that was not exporting with a plain variable, instead found ${node.declaration.type}.
            Assign that to a variable with a unique name and export that variable as the default instead.

            It should look like:
            const myUniqueVariable = someThingYouDo(Component)
            export default myUniqueVariable

            This error was found in ${file.opts.sourceFileName}

          `)
        }

        if (waitsFor) {
          const waitsForIdentifiers = waitsFor.filter(waiter => scope.hasBinding(waiter)).map(waiter => t.identifier(waiter))
          const ssrWaitsFor = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(node.declaration.name), t.identifier('ssrWaitsFor')),
            t.arrayExpression(waitsForIdentifiers)
          )
  
          path.insertBefore(ssrWaitsFor)
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
        const isNotDOMElement = element.name && element.name !== element.name.toLowerCase()

        if (isNotDOMElement) {
          const waitsFor = file.get('ssrWaitsFor') || []
          const component = element.name

          if (!waitsFor.includes(component)) {
            waitsFor.push(component)
          }

          file.set('ssrWaitsFor', waitsFor)
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
    },

    FunctionDeclaration: function (path, state) {        
      if (doesReturnJSX(path.node.body) || (path.node.id && path.node.id.name &&
                                            isKnownComponent(path.node.id.name, state.opts.knownComponents))) {
        var displayName
        if (path.parentPath.node.type === 'ExportDefaultDeclaration') {
          if (path.node.id == null) {
            // An anonymous function declaration in export default declaration.
            // Transform `export default function () { ... }`
            // to `var _uid1 = function () { .. }; export default __uid;`
            // then add displayName to _uid1  
            var extension = pathMod.extname(state.file.opts.filename) 
            var name = pathMod.basename(state.file.opts.filename, extension)
            
            var id = path.scope.generateUidIdentifier("uid");
            path.node.id = id
            displayName = name
          }
          setDisplayNameAfter(path, path.node.id, babel.types, displayName)
        }else if(path.parentPath.node.type === 'Program' || path.parentPath.node.type == 'ExportNamedDeclaration') {
          setDisplayNameAfter(path, path.node.id, babel.types, displayName)
        }
      }
    },

    FunctionExpression: function (path, state) {
      if(shouldSetDisplayNameForFuncExpr(path, state.opts.knownComponents)) {
        var id = findCandidateNameForExpression(path)
        if (id) {
          setDisplayNameAfter(path, id, babel.types)
        }
      }
    },

    ArrowFunctionExpression: function (path, state) {
      if(shouldSetDisplayNameForFuncExpr(path, state.opts.knownComponents)) {
        var id = findCandidateNameForExpression(path)
        if (id) {
          setDisplayNameAfter(path, id, babel.types)
        }
      }
    }
  }
}

function isKnownComponent(name, knownComponents) {
  return (name && knownComponents && knownComponents.indexOf(name) > -1)
}

function shouldSetDisplayNameForFuncExpr(path, knownComponents) {
  // Parent must be either 'AssignmentExpression' or 'VariableDeclarator' or 'CallExpression' with a parent of 'VariableDeclarator'
  var id
  if (path.parentPath.node.type === 'AssignmentExpression' &&
      path.parentPath.node.left.type !== 'MemberExpression' && // skip static members 
      path.parentPath.parentPath.node.type == 'ExpressionStatement' &&
      path.parentPath.parentPath.parentPath.node.type == 'Program') {
    id = path.parentPath.node.left
  } else {
    // if parent is a call expression, we have something like (function () { .. })()
    // move up, past the call expression and run the rest of the checks as usual
    if (path.parentPath.node.type === 'CallExpression') {
      path = path.parentPath
    }

    if (path.parentPath.node.type === 'VariableDeclarator') {
      if (path.parentPath.parentPath.parentPath.node.type === 'ExportNamedDeclaration' ||
          path.parentPath.parentPath.parentPath.node.type === 'Program') {
        id = path.parentPath.node.id
      }
    } 
  }

  if (id) {
    if (id.name && isKnownComponent(id.name, knownComponents)) {
      return true
    }

    return doesReturnJSX(path.node.body)
  }

  return false
}

// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-react-display-name/src/index.js#L62-L77
// crawl up the ancestry looking for possible candidates for displayName inference
function findCandidateNameForExpression(path) {
  var id
  path.find(function (path) {
    if (path.isAssignmentExpression()) {
      id = path.node.left;
    // } else if (path.isObjectProperty()) {
      // id = path.node.key;
    } else if (path.isVariableDeclarator()) {
      id = path.node.id;
    } else if (path.isStatement()) {
      // we've hit a statement, we should stop crawling up
      return true;
    }

    // we've got an id! no need to continue
    if (id) return true;
  });
  return id
}

function doesReturnJSX (body) {
  if (!body) return false
  if (body.type === 'JSXElement') {
    return true
  }

  var block = body.body
  if (block && block.length) {
    var lastBlock = block.slice(0).pop()

    if (lastBlock.type === 'ReturnStatement') {
      return lastBlock.argument !== null && lastBlock.argument.type === 'JSXElement'
    }
  }

  return false
}

export default transform
