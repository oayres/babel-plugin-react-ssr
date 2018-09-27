import classHasRenderMethod from '../helpers/classHasRenderMethod'
import setDisplayNameAfter from '../helpers/setDisplayNameAfter'

const classDeclaration = (babel, path, state) => {
  if (classHasRenderMethod(path)) {
    const { body = [] } = path.node.body || {}

    body.forEach(propertyOrMethod => {
      if (propertyOrMethod.static && propertyOrMethod.key.name === 'fetchData') {
        state.file.set('hasFetchData', true)
      }
    })

    setDisplayNameAfter(path, path.node.id, babel.types)
  }
}

export default classDeclaration
