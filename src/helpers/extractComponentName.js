import path from 'path'

const componentNameFromFilename = filename => {
  var extension = path.extname(filename)
  var name = path.basename(filename, extension)
  return name
}

export default componentNameFromFilename
