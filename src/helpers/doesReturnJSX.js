const doesReturnJSX = (element = {}) => {
  if (element.type === 'JSXElement') {
    return true
  }

  const { body = [] } = element

  if (body.length) {
    const lastBlock = body.slice(0).pop()

    if (lastBlock.type === 'ReturnStatement') {
      return lastBlock.argument.type === 'JSXElement'
    }
  }

  return false
}

export default doesReturnJSX
