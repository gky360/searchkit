import { State } from "./State"
const map = require("lodash/map")
const noop = require("lodash/noop")
const isEmpty = require("lodash/isEmpty")
const forOwn = require("lodash/forOwn")
const hasIn = require("lodash/hasIn")


export type Subtree = { string: Subtree } | {} | ""

export class TreeState extends State<Subtree> {
  value: Subtree // root of the tree

  getValue() {
    return this.value || {}
  }

  isEmpty() {
    return isEmpty(this.value)
  }

  hasPath(path) {
    return hasIn(this.getValue(), path)
  }

  walk(config:any = {}) {
    const path = []
    const beforeFunc = (typeof config.beforeFunc === "function") ? config.beforeFunc : noop
    const afterFunc = (typeof config.afterFunc === "function") ? config.afterFunc : noop
    const leafFunc = (typeof config.leafFunc === "function") ? config.leafFunc : noop
    const dfs = (subtree:Subtree) => {
      beforeFunc(path)
      const isLeaf = isEmpty(subtree)
      if (isLeaf) {
        leafFunc(path)
      } else {
        forOwn(subtree, (children, key) => {
          path.push(key)
          dfs(children)
          path.pop()
        })
      }
      afterFunc(path)
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
