/** @jsx jsx */
import { jsx } from '@emotion/core';
import { defaultType, listItemType, orderedListType, unorderedListType } from '../constants';
import * as embed from './embed';
import * as image from './image';
import * as link from './link';
import * as heading from './heading';
import * as blockquote from './blockquote';
import { hasAncestorBlock, hasBlock } from '../utils';
import { ListOrderedIcon, ListUnorderedIcon } from '@voussoir/icons';
import { ToolbarCheckbox } from '../ToolbarCheckbox';

let handleListButtonClick = (editor, editorState, type) => {
  let isList = hasBlock(editorState, listItemType);
  let isOrderedList = hasAncestorBlock(editorState, type);

  let otherListType = type === orderedListType ? unorderedListType : orderedListType;

  if (isList && isOrderedList) {
    editor.setBlocks(defaultType);
    editor.unwrapBlock(type);
  } else if (isList) {
    editor.unwrapBlock(otherListType);
    editor.wrapBlock(type);
  } else {
    editor.setBlocks(listItemType).wrapBlock(type);
  }
};

export let blocks = {
  [embed.type]: embed,
  [image.type]: image,
  [defaultType]: {
    renderNode({ attributes, children }) {
      return <p {...attributes}>{children}</p>;
    },
  },
  [blockquote.type]: blockquote,
  // technically link isn't a block, it's an inline but it's easier to have it here
  [link.type]: link,
  [listItemType]: {
    renderNode({ attributes, children }) {
      return <li {...attributes}>{children}</li>;
    },
  },
  [heading.type]: heading,
  [orderedListType]: {
    ToolbarElement({ editor, editorState }) {
      return (
        <ToolbarCheckbox
          label="Ordered List"
          id="ordered-list-input"
          icon={ListOrderedIcon}
          isActive={hasAncestorBlock(editorState, orderedListType)}
          onChange={() => {
            handleListButtonClick(editor, editorState, orderedListType);
          }}
        />
      );
    },
    renderNode({ attributes, children }) {
      return <ol {...attributes}>{children}</ol>;
    },
  },
  [unorderedListType]: {
    ToolbarElement({ editor, editorState }) {
      return (
        <ToolbarCheckbox
          label="Unordered List"
          id="unordered-list-input"
          icon={ListUnorderedIcon}
          isActive={hasAncestorBlock(editorState, unorderedListType)}
          onChange={() => {
            handleListButtonClick(editor, editorState, unorderedListType);
          }}
        />
      );
    },
    renderNode({ attributes, children }) {
      return <ul {...attributes}>{children}</ul>;
    },
  },
};

export let blockTypes = Object.keys(blocks);

// making it an array so we can add more in the future
export let blockPlugins = [
  {
    renderNode(props, editor, next) {
      let block = blocks[props.node.type];
      if (block) {
        return block.renderNode(props, editor);
      }
      next();
    },
  },
];

blockTypes.forEach(type => {
  let plugins = blocks[type].plugins;
  if (plugins !== undefined) {
    blockPlugins.push(...plugins);
  }
});
