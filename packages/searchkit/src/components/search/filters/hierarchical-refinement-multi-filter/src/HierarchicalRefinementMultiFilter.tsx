import * as React from "react"
import * as PropTypes from "prop-types"

import {
  SearchkitComponent,
  TreeFacetAccessor,
  FastClick,
  SearchkitComponentProps,
  RenderComponentType,
  renderComponent,
  RenderComponentPropType
} from "../../../../../core"

import {
  Panel, ItemComponent, ItemProps
} from "../../../../ui"

const defaults = require("lodash/defaults")
const map = require("lodash/map")
const identity = require("lodash/identity")

export interface HierarchicalRefinementMultiFilterProps extends SearchkitComponentProps {
  field:string
  id:string
  title:string
  size?:number
  orderKey?:string
  orderDirection?:string
  startLevel?:number
  countFormatter?:(count:number)=> number | string,
  containerComponent?: RenderComponentType<any>,
  itemComponent?: RenderComponentType<ItemProps>
}

export class HierarchicalRefinementMultiFilter extends SearchkitComponent<HierarchicalRefinementMultiFilterProps, any> {
  public accessor:TreeFacetAccessor

  static defaultProps = {
    countFormatter:identity,
    containerComponent: Panel,
    itemComponent: ItemComponent
  }

  static propTypes = defaults({
    field:PropTypes.string.isRequired,
    id:PropTypes.string.isRequired,
    title:PropTypes.string.isRequired,
    orderKey:PropTypes.string,
    orderDirection:PropTypes.oneOf(["asc", "desc"]),
    startLevel:PropTypes.number,
    countFormatter:PropTypes.func
  }, SearchkitComponent.propTypes)

  defineBEMBlocks() {
    var blockClass = this.props.mod || "sk-hierarchical-refinement";
    return {
      container: `${blockClass}-list`,
      option: `${blockClass}-option`
    }
  }

  defineAccessor() {
    const {
      field,
      id,
      title,
      size,
      orderKey,
      orderDirection,
      startLevel } = this.props;

    return new TreeFacetAccessor(id, {
      field,
      id,
      title,
      size,
      orderKey,
      orderDirection,
      startLevel
    });
  }

  renderOption(parentPath, option) {
    const block = this.bemBlocks.container
    const { key, doc_count } = option
    const path = [...parentPath, key]
    const active = this.accessor.resultsState.hasPath(path)
    const { countFormatter, itemComponent } = this.props

    return (
      <div key={key}>
        {
          renderComponent(itemComponent, {
            active,
            bemBlocks:this.bemBlocks,
            label:this.translate(key),
            itemKey:option.key,
            count:countFormatter(doc_count),
            showCount:true,
          })
        }
        {active && this.renderOptions(path)}
      </div>
    )
    // onClick: this.addFilter.bind(this, level, option)
  }

  renderOptions(path = []) {
    const block = this.bemBlocks.container
    const { resultsState } = this.accessor
    const buckets = this.accessor.getBuckets(path)
    return(
      <div className={block("hierarchical-options")}>
        {
          map(buckets, this.renderOption.bind(this, path))
        }
      </div>
    )
  }

  render() {
    const block = this.bemBlocks.container
    const { id, title, containerComponent } = this.props
    return renderComponent(
      containerComponent, {
        title,
        className: id ? `filter--${id}` : undefined,
        disabled: this.accessor.getBuckets().length == 0
      },
      <div className={block("root")}>
        {this.renderOptions()}
      </div>
    )
  }

}
