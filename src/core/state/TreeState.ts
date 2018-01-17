import { State } from "./State"
const map = require("lodash/map")
const noop = require("lodash/noop")
const isEmpty = require("lodash/isEmpty")
const forOwn = require("lodash/forOwn")


export type Subtree = { string: Subtree } | {} | ""

export class TreeState extends State<Subtree> {
  value: Subtree // root of the tree

  getValue() {
    return this.value || {}
  }

  isEmpty() {
    return isEmpty(this.value)
  }

  walk(config:any = {}) {
    const path = []
    const beforeFunc = (typeof config.beforeFunc === "function") ? config.beforeFunc : noop
    const afterFunc = (typeof config.afterFunc === "function") ? config.afterFunc : noop
    const leafFunc = (typeof config.leafFunc === "function") ? config.leafFunc : noop
    const dfs = (subtree:Subtree) => {
      forOwn(subtree, (children, key) => {
        const isLeaf = isEmpty(children)
        path.push(key)
        beforeFunc(path)
        if (isLeaf) {
          leafFunc(path)
        } else {
          dfs(children)
        }
        afterFunc(path)
        path.pop()
      })
    }

    dfs(this.value)
  }
}

// const t = new TreeState(
//   {
//     "USA": {
//       "East Coast": {},
//       "West Coast": {
//         "Arizona": {}
//       },
//     },
//     "Africa": {
//       "Egypt": {}
//     }
//   }
// )
//
// console.log(t);
