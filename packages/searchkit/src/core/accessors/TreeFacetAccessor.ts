import { TreeState } from "../state"
import { FilterBasedAccessor } from "./FilterBasedAccessor"
import {
  NestedQuery,
  TermQuery,
  BoolMust,
  BoolShould,
} from "../query"
const map = require("lodash/map")

export interface TreeFacetAccessorOptions {
  field:string
  id:string
  title:string
  size?:number
  orderKey?:string
  orderDirection?:string
  startLevel?:number
}

export class TreeFacetAccessor extends FilterBasedAccessor<TreeState> {
  state = new TreeState()
  options:any

  constructor(key, options:TreeFacetAccessorOptions) {
    super(key, options.id)
    this.options = options
  }

  fromQueryObject(ob){
    let value = ob[this.urlKey]
    if (this.urlKey == 'categories') {
      console.log('TreeFacetAccessor fromQueryObject()');
      console.log(value)
    }
    this.state = this.state.setValue(value)
  }

  buildSharedQuery(query) {
    console.log('TreeFacetAccessor buildSharedQuery()')

    const pathQueries = []
    this.state.walk({
      leafFunc: (path) => {
        console.log(path);
        const lastIndex = path.length - 1
        const filterTerms = map(path, (value, i) => {
          const isLeaf = (i === lastIndex)
          const subField = isLeaf ? ".value" : ".ancestors"
          return TermQuery(this.options.field + subField, value)
        })
        pathQueries.push(BoolMust(filterTerms))
      }
    })

    if (pathQueries.length > 0) {
      const treeQuery = BoolShould(pathQueries)
      query = query.addFilter(
        this.uuid,
        NestedQuery(this.options.field, treeQuery)
      )
    }

    return query
  }

}
