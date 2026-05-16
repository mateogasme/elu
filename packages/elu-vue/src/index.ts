import './styles.css';
import type { App } from 'vue';

import Root from './Root.vue';
import Trigger from './Trigger.vue';
import Value from './Value.vue';
import Content from './Content.vue';
import Viewport from './Viewport.vue';
import Item from './Item.vue';
import ItemText from './ItemText.vue';
import ItemIndicator from './ItemIndicator.vue';
import Group from './Group.vue';
import GroupLabel from './GroupLabel.vue';
import Separator from './Separator.vue';
import Search from './Search.vue';
import Empty from './Empty.vue';

export {
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

const parts = {
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

export const Elu = {
  ...parts,
  install(app: App) {
    for (const [name, component] of Object.entries(parts)) {
      app.component(`Elu${name}`, component);
    }
  },
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
