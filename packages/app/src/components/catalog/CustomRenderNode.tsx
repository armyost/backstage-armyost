import React, { useLayoutEffect, useRef, useState } from 'react';
import { DependencyGraphTypes } from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  node: {
    stroke: '#000',
    strokeWidth: 2,
    '&.focused': {
      strokeWidth: 3,
    },
    '&.clickable': {
      cursor: 'pointer',
    },
    // Entity Kind specific styles
    '&.system': {
      fill: '#F5DC70',
      stroke: '#F2CE34',
    },
    '&.domain': {
      fill: '#F5DC70',
      stroke: '#F2CE34',
    },
    '&.component': {
      fill: '#85E1FF',
      stroke: '#2196F3',
    },
    '&.service': {
      fill: '#85E1FF',
      stroke: '#2196F3',
    },
    '&.api': {
      fill: '#98FB98',
      stroke: '#4CAF50',
    },
    '&.group': {
      fill: '#FFB366',
      stroke: '#FF9800',
    },
    '&.user': {
      fill: '#E1BEE7',
      stroke: '#9C27B0',
    },
    '&.resource': {
      fill: '#FFCCBC',
      stroke: '#FF6E40',
    },
    '&.template': {
      fill: '#B2DFDB',
      stroke: '#009688',
    },
    '&.unknown': {
      fill: '#BDBDBD',
      stroke: '#757575',
    },
  },
  text: {
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fill: '#000',
    pointerEvents: 'none',
    '&.focused': {
      fontWeight: 'bold',
    },
  },
  clickable: {
    cursor: 'pointer',
  },
}));

export const CustomRenderNode = (
  props: DependencyGraphTypes.RenderNodeProps<any>,
) => {
  const classes = useStyles();
  const { node } = props;
  const { id } = node;
  
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const idRef = useRef<SVGTextElement | null>(null);

  useLayoutEffect(() => {
    // set the width to the length of the ID
    if (idRef.current) {
      let { height: renderedHeight, width: renderedWidth } =
        idRef.current.getBBox();
      renderedHeight = Math.round(renderedHeight);
      renderedWidth = Math.round(renderedWidth);

      if (renderedHeight !== height || renderedWidth !== width) {
        setWidth(renderedWidth);
        setHeight(renderedHeight);
      }
    }
  }, [width, height]);

  const padding = 10;
  const paddedWidth = width + padding * 2;
  const paddedHeight = height + padding * 2;
  
  // Extract kind from node ID (format: "kind:namespace/name")
  const kind = id.split(':')[0]?.toLowerCase();

  return (
    <g 
      onClick={node.onClick} 
      className={classNames(node.onClick && classes.clickable)}
    >
      <rect
        className={classNames(
          classes.node,
          kind,
          node.focused && 'focused',
        )}
        width={paddedWidth}
        height={paddedHeight}
        rx={4}
        ry={4}
      />
      <text
        ref={idRef}
        className={classNames(classes.text, node.focused && 'focused')}
        y={paddedHeight / 2}
        x={paddedWidth / 2}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {id}
      </text>
    </g>
  );
};
