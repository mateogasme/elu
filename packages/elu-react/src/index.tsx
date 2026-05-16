'use client';

import './styles.css';

export { Root } from './Root';
export { Trigger } from './Trigger';
export { Value } from './Value';
export { Content } from './Content';
export { Viewport } from './Viewport';
export { Item } from './Item';
export { ItemText } from './ItemText';
export { ItemIndicator } from './ItemIndicator';
export { Group } from './Group';
export { GroupLabel } from './GroupLabel';
export { Separator } from './Separator';
export { Search } from './Search';
export { Empty } from './Empty';

import { Root } from './Root';
import { Trigger } from './Trigger';
import { Value } from './Value';
import { Content } from './Content';
import { Viewport } from './Viewport';
import { Item } from './Item';
import { ItemText } from './ItemText';
import { ItemIndicator } from './ItemIndicator';
import { Group } from './Group';
import { GroupLabel } from './GroupLabel';
import { Separator } from './Separator';
import { Search } from './Search';
import { Empty } from './Empty';

export const Elu = {
  Root,
  Trigger,
  Value,
  Content,
  Viewport,
  Item,
  ItemText,
  ItemIndicator,
  Group,
  GroupLabel,
  Separator,
  Search,
  Empty,
};

export type {
  EluRootProps,
  EluTriggerProps,
  EluValueProps,
  EluContentProps,
  EluViewportProps,
  EluItemProps,
  EluGroupProps,
  EluSearchProps,
  EluChangeDetail,
  Dir,
  Side,
  Align,
  Size,
  Theme,
} from '@mgasme/elu-core/types';
