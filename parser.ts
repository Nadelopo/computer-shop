// const fs = require('fs')
// const path = require('path')
// const parser = require('@babel/parser')
// const traverse = require('@babel/traverse').default

// // Путь к файлу маршрутов
// const filePath = path.resolve(__dirname, 'src/router/index.ts')

// // Чтение файла
// const code = fs.readFileSync(filePath, 'utf-8')

// // Парсинг файла в AST
// const ast = parser.parse(code, {
//   sourceType: 'module',
//   plugins: ['typescript'] // Учитываем TypeScript
// })

// // Массив для хранения маршрутов
// const routes = []
// // Карта для хранения импортированных данных
// const importedVariables = {}
// const importedRoutes = {}

// // Функция для извлечения внутреннего выражения из TS-аннотаций
// function getInnerExpression(node) {
//   if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
//     return getInnerExpression(node.expression)
//   }
//   return node
// }

// // Обход AST
// traverse(ast, {
//   // Обработка импорта
//   ImportDeclaration(path) {
//     path.node.specifiers.forEach((specifier) => {
//       const importedName = specifier.local.name
//       const source = path.node.source.value
//       if (source) {
//         importedVariables[importedName] = source
//       }
//     })
//   },

//   // Обработка переменных
//   VariableDeclarator(path) {
//     const varName = path.node.id.name
//     if (path.node.init) {
//       let init = path.node.init

//       // Убираем TS-аннотации
//       init = getInnerExpression(init)

//       // Если это массив, анализируем его
//       if (init.type === 'ArrayExpression') {
//         const elements = init.elements

//         elements.forEach((element) => {
//           if (element.type === 'SpreadElement') {
//             // Обработка спред-операторов
//             const spreadName = element.argument.name
//             // routes.push({ type: 'spread', name: spreadName })
//             if (importedVariables[spreadName]) {
//               importedRoutes[spreadName] = importedVariables[spreadName]
//             }
//           } else if (element.type === 'ObjectExpression') {
//             // Обработка объектов маршрутов
//             const route = {}
//             element.properties.forEach((prop) => {
//               const key =
//                 prop.key.type === 'Identifier' ? prop.key.name : prop.key.value
//               if (prop.value.type === 'StringLiteral') {
//                 route[key] = prop.value.value
//               } else if (prop.value.type === 'ArrowFunctionExpression') {
//                 route[key] = 'Lazy-loaded Component'
//               } else if (prop.value.type === 'Identifier') {
//                 route[key] = prop.value.name
//               }
//             })
//             routes.push(route)
//           }
//         })
//       }
//     }
//   }
// })
// console.log(importedRoutes)
// // Вывод маршрутов
// console.log(routes)

const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

// Путь к файлу маршрутов

const rootPath = 'src/router/'
const filePath = path.resolve(__dirname, 'src/router/index.ts')

// Чтение файла
const code = fs.readFileSync(filePath, 'utf-8')

// Парсинг файла в AST
const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['typescript'] // Учитываем TypeScript
})

// Массив для хранения маршрутов
const routes = []
// Карта для хранения импортированных данных
const importedVariables = {}
const importedRoutes = {}

// Функция для извлечения внутреннего выражения из TS-аннотаций
function getInnerExpression(node) {
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
    return getInnerExpression(node.expression)
  }
  return node
}

// Функция для загрузки и парсинга файла маршрутов
function loadRoutesFromFile(filePath) {
  try {
    const fileCode = fs.readFileSync(filePath, 'utf-8')
    const fileAst = parser.parse(fileCode, {
      sourceType: 'module',
      plugins: ['typescript']
    })

    const fileRoutes = []
    traverse(fileAst, {
      VariableDeclarator(path) {
        if (
          path.node.id.name === 'routes' ||
          Object.keys(importedRoutes).includes(path.node.id.name)
        ) {
          console.log(133)
          let { init } = path.node
          init = getInnerExpression(init)

          if (init.type === 'ArrayExpression') {
            init.elements.forEach((element) => {
              if (element.type === 'ObjectExpression') {
                const route = {}
                element.properties.forEach((prop) => {
                  console.log(prop.key.name)
                  const key =
                    prop.key.type === 'Identifier'
                      ? prop.key.name
                      : prop.key.value
                  if (prop.value.type === 'StringLiteral') {
                    route[key] = prop.value.value
                  } else if (prop.value.type === 'ArrowFunctionExpression') {
                    route[key] = 'Lazy-loaded Component'
                  } else if (prop.value.type === 'Identifier') {
                    route[key] = prop.value.name
                  }
                })
                fileRoutes.push(route)
              }
            })
          }
        }
      }
    })
    return fileRoutes
  } catch (err) {
    console.error(`Error loading or parsing file: ${filePath}`, err)
    return []
  }
}

// Обход AST основного файла
traverse(ast, {
  // Обработка импорта
  ImportDeclaration(path) {
    path.node.specifiers.forEach((specifier) => {
      const importedName = specifier.local.name
      const source = path.node.source.value
      if (source) {
        importedVariables[importedName] = source
      }
    })
  },

  // Обработка переменных
  VariableDeclarator(path) {
    const varName = path.node.id.name
    if (path.node.init) {
      let init = path.node.init
      init = getInnerExpression(init)

      // Если это массив, анализируем его
      if (init.type === 'ArrayExpression') {
        const elements = init.elements

        elements.forEach((element) => {
          if (element.type === 'SpreadElement') {
            // Обработка спред-операторов
            const spreadName = element.argument.name
            if (importedVariables[spreadName]) {
              importedRoutes[spreadName] = importedVariables[spreadName]
            }
          } else if (element.type === 'ObjectExpression') {
            // Обработка объектов маршрутов
            const route = {}
            element.properties.forEach((prop) => {
              const key =
                prop.key.type === 'Identifier' ? prop.key.name : prop.key.value
              if (prop.value.type === 'StringLiteral') {
                route[key] = prop.value.value
              } else if (prop.value.type === 'ArrowFunctionExpression') {
                route[key] = 'Lazy-loaded Component'
              } else if (prop.value.type === 'Identifier') {
                route[key] = prop.value.name
              }
            })
            routes.push(route)
          }
        })
      }
    }
  }
})

// Теперь загружаем маршруты из импортированных файлов
for (const [spreadName, filePath] of Object.entries(importedRoutes)) {
  // console.log(spreadName, filePath)
  const fullFilePath = path.resolve(
    `${__dirname}/${rootPath}`,
    `${filePath}.ts`
  )
  // console.log(__dirname, rootPath, filePath)
  // console.log(fullFilePath)
  const importedFileRoutes = loadRoutesFromFile(fullFilePath)
  // console.log(importedFileRoutes, fullFilePath)
  routes.push(...importedFileRoutes)
}

// Вывод импортированных путей
console.log('Imported Routes:', importedRoutes)

// Вывод маршрутов
console.log('Routes:', routes)
