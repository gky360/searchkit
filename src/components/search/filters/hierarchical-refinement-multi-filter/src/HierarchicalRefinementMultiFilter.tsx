import * as React from "react"
import * as PropTypes from "prop-types"

import {
  SearchkitComponent,
  TreeFacetAccessor,
  FastClick,
  SearchkitComponentProps
} from "../../../../../core"

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
  countFormatter?:(count:number)=> number | string
}

export class HierarchicalRefinementMultiFilter extends SearchkitComponent<HierarchicalRefinementMultiFilterProps, any> {
  public accessor:TreeFacetAccessor

  static defaultProps = {
    countFormatter:identity
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

  render() {
    return (
      <div>HierarchicalRefinementMultiFilter</div>
    )
  }

}
