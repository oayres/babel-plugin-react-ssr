import classHasRenderMethod from '../helpers/classHasRenderMethod'

const classDeclaration = (babel, path, state) => {
  if (classHasRenderMethod(path)) {
    const { body = [] } = path.node.body || {}

    // Store the display name of the class for recusive checks
    state.file.set('displayName', path.node.id.name)

    body.forEach(propertyOrMethod => {
      if (propertyOrMethod.static && propertyOrMethod.key.name === 'fetchData') {
        state.file.set('hasFetchData', true)
      }
    })
  }
}

export default classDeclaration
