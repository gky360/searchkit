import { State } from "./State"
const map = require("lodash/map")
const noop = require("lodash/noop")
const get = require("lodash/get")
const set = require("lodash/set")
const unset = require("lodash/unset")
const size = require("lodash/size")
const isEmpty = require("lodash/isEmpty")
const forOwn = require("lodash/forOwn")
const hasIn = require("lodash/hasIn")


export type Subtree = { string: Subtree } | {} | ""

export class TreeState extends State<Subtree> {
  value: Subtree // root of the tree

  constructor(value = null) {
    super(value)
    this.value = this.value || {}
  }

  getValue() {
    return this.value || {}
  }

  getSubtree(path = []) {
    if (path.length === 0) {
      return this.getValue()
    }
    return get(this.getValue(), path)
  }

  isEmpty() {
    return isEmpty(this.value)
  }

  hasPath(path) {
    if (path.length === 0) {
      return true
    }
    return hasIn(this.getValue(), path)
  }

  isLeaf(path) {
    return this.hasPath(path) && isEmpty(this.getSubtree(path))
  }

  addPath(path) {
    if (!this.hasPath(path)) {
      set(this.value, path, "")
    }
    return this
  }

  popLeaf(path) {
    if (this.isLeaf(path)) {
      this.clearSubtree(path.slice(0, -1))
    }
    return this
  }

  clear() {
    return this.clearSubtree([])
  }

  clearSubtree(path) {
    if (this.hasPath(path)) {
      if (path.length === 0) {
        this.value = {}
      } else {
        set(this.value, path, "")
      }
    }
    return this
  }

  clearPath(path) {
    if (!this.hasPath(path)) {
      return this
    }
    for (let i = path.length - 1; i >= 0; i--) {
      if (size(this.getSubtree(path.slice(0, i))) > 1) {
        unset(this.value, path.slice(0, i + 1))
        return this
      }
    }
    return this.clear()
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

  toggleNode(path):TreeState {
    if (this.hasPath(path)) {
      if (this.isLeaf(path)) {
        this.popLeaf(path)
      } else {
        this.clearSubtree(path)
      }
    } else {
      this.addPath(path)
    }
    return this
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
