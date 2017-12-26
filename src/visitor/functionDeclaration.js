import pathMod from 'path'
import doesReturnJSX from '../helpers/doesReturnJSX'
import isKnownComponent from '../helpers/isKnownComponent'
import assignWaitsForProperty from '../helpers/assignWaitsForProperty'

const functionDeclaration = (babel, path, state) => {
  var isReactComponent = doesReturnJSX(path.node.body) || (path.node.id && path.node.id.name && isKnownComponent(path.node.id.name, state.opts.knownComponents))

  if (isReactComponent) {
    var waitsFor

    if (path.parentPath.node.type === 'ExportDefaultDeclaration') {
      if (path.node.id == null) {
        // An anonymous function declaration in export default declaration.
        // Transform `export default function () { ... }`
        // to `var _uid1 = function () { .. }; export default __uid;`
        // then add displayName to _uid1

        // in Owen's update, this needs to find all components used in this 
        // file and build an array of them.
        var extension = pathMod.extname(state.file.opts.filename) 
        var name = pathMod.basename(state.file.opts.filename, extension)
        var id = path.scope.generateUidIdentifier('uid')

        path.node.id = id
        waitsFor = name
      }

      assignWaitsForProperty(path, path.node.id, babel.types, waitsFor)
    } else if (path.parentPath.node.type === 'Program' || path.parentPath.node.type == 'ExportNamedDeclaration') {
      assignWaitsForProperty(path, path.node.id, babel.types, waitsFor)
    }
  }
}

export default functionDeclaration
