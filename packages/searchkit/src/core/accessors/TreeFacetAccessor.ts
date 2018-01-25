import { TreeState } from "../state"
import { FilterBasedAccessor } from "./FilterBasedAccessor"
import {
  TermQuery,
  TermsBucket,
  FilterBucket,
  BoolMust,
  BoolShould,
  NestedQuery,
  NestedBucket,
  MinMetric,
  DefaultNumberBuckets
} from "../query";
const map = require("lodash/map")
const get = require("lodash/get")
const includes = require("lodash/includes")
const startsWith = require("lodash/startsWith")
const each = require("lodash/each")
const take = require("lodash/take")

const aggKeyPrefix = "path-"
const toAggKey = (path) => (aggKeyPrefix + path.join('.'))


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

  // fromQueryObject(ob){
  //   let value = ob[this.urlKey]
  //   if (this.urlKey == 'categories') {
  //     console.log('TreeFacetAccessor fromQueryObject()');
  //     console.log(value)
  //   }
  //   this.state = this.state.setValue(value)
  // }

  getBuckets(path = []) {
    let buckets:Array<any> = this.getAggregations(
      [this.key, "children", toAggKey(path), "children", "buckets"],
      []
    )
    return map(buckets, (item)=> {
      item.key = String(item.key)
      return item
    })
  }

  removeSelectedFilter(path) {
    this.state = this.state.clearPath(path)
  }

  buildSharedQuery(query) {
    console.log('TreeFacetAccessor buildSharedQuery()')

    const pathQueries = []
    const selectedFilters = []
    this.state.walk({
      leafFunc: (path) => {
        const lastIndex = path.length - 1
        const filterTerms = map(path, (value, i) => {
          const isLeaf = (i === lastIndex)
          const subField = isLeaf ? ".value" : ".ancestors"
          return TermQuery(this.options.field + subField, value)
        })
        pathQueries.push(BoolMust(filterTerms))

        if (path.length > 0) {
          const leaf = path[path.length - 1] || ""
          const parentOfLeaf = path[path.length - 2] || this.options.title || this.key
          console.log(path);
          const selectedFilter = {
            id: this.key,
            name: this.translate(parentOfLeaf),
            value: leaf,
            remove: this.removeSelectedFilter.bind(this, [...path])
          }
          selectedFilters.push(selectedFilter)
        }
      }
    })

    if (pathQueries.length > 0) {
      const treeQuery = BoolShould(pathQueries)
      query = query.addFilter(
        this.uuid,
        NestedQuery(this.options.field, treeQuery)
      )
    }
    query = query.addSelectedFilters(selectedFilters)

    return query
  }

  getTermAggs(){
    let subAggs = undefined
    let orderMetric = undefined
    if(this.options.orderKey){
      let orderDirection = this.options.orderDirection || "asc"
      let orderKey = this.options.orderKey
      if(includes(["_count", "_term"], orderKey)) {
        orderMetric = {[orderKey]:orderDirection}
      } else {
        if(startsWith(orderKey, this.options.field + ".")){
          const subAggName = this.options.field + "_order"
          orderMetric = {
            [subAggName]:orderDirection
          }
          subAggs = MinMetric(subAggName, orderKey)
        }
      }
    }

    let valueField = this.options.field+".value";
    let nBuckets = this.options.size || DefaultNumberBuckets;

    return TermsBucket(
      "children", valueField,
      { size:nBuckets, order:orderMetric },
      subAggs
    )
  }

  buildOwnQuery(query) {
    const levelField = this.options.field+".level"
    const ancestorsField = this.options.field+".ancestors"
    const startLevel = this.options.startLevel || 1
    const termAggs = this.getTermAggs()
    const treeNodeAgss = []

    this.state.walk({
      beforeFunc: (path) => {
        const level = path.length
        const ancestorsQuery = map(path, (key) => (TermQuery(ancestorsField, key)))
        treeNodeAgss.push(
          FilterBucket(
            toAggKey(path),
            BoolMust([TermQuery(levelField, level + startLevel), ...ancestorsQuery]),
            termAggs
          )
        )
      }
    })

    query = query.setAggs(
      FilterBucket(
        this.key,
        query.getFiltersWithoutKeys(this.uuid),
        NestedBucket(
          "children",
          this.options.field,
          ...treeNodeAgss
        )
      )
    )
    return query
  }

}
