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
//   plugins: ['typescript', 'jsx'] // Учитываем TypeScript и JSX
// })

// // Массив для хранения маршрутов
// const routes = []

// // Обход AST
// traverse(ast, {
//   VariableDeclarator(path) {
//     if (path.node.id.name === 'routes') {
//       const elements = path.node.init.elements

//       console.log(path.node.init)

//       // elements.forEach((element) => {
//       //   if (element.type === 'SpreadElement') {
//       //     // Обработка спред-операторов
//       //     routes.push({ type: 'spread', name: element.argument.name })
//       //   } else if (element.type === 'ObjectExpression') {
//       //     // Обработка объектов маршрутов
//       //     const route = {}
//       //     element.properties.forEach((prop) => {
//       //       const key =
//       //         prop.key.type === 'Identifier' ? prop.key.name : prop.key.value
//       //       if (prop.value.type === 'StringLiteral') {
//       //         route[key] = prop.value.value
//       //       } else if (prop.value.type === 'ArrowFunctionExpression') {
//       //         route[key] = 'Lazy-loaded Component'
//       //       } else if (prop.value.type === 'Identifier') {
//       //         route[key] = prop.value.name
//       //       }
//       //     })
//       //     routes.push(route)
//       //   }
//       // })
//     }
//   }
// })

// // Вывод маршрутов
// console.log(routes)

const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

// Путь к файлу маршрутов
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

// Функция для извлечения внутреннего выражения из TS-аннотаций
function getInnerExpression(node) {
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
    return getInnerExpression(node.expression)
  }
  return node
}

// Обход AST
traverse(ast, {
  VariableDeclarator(path) {
    if (path.node.id.name === 'routes') {
      let init = path.node.init

      // Убираем TS-аннотации
      init = getInnerExpression(init)

      // Проверяем, что это массив
      if (init.type === 'ArrayExpression') {
        const elements = init.elements

        elements.forEach((element) => {
          if (element.type === 'SpreadElement') {
            // Обработка спред-операторов
            routes.push({ type: 'spread', name: element.argument.name })
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
      } else {
        console.error('`routes` is not an array or has a different structure.')
      }
    }
  }
})

// Вывод маршрутов
console.log(routes)
