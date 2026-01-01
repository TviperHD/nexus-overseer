import type { Tab } from '@/types/tab';

/**
 * Tab type for panel tabs
 */
export type TabType = 'editor' | 'chat' | 'file-tree' | 'tasks';

/**
 * Tab type configuration
 */
export interface TabTypeConfig {
  type: TabType;
  label: string;
  icon?: string;
  component: string;
}

/**
 * Available tab types with their configurations
 */
export const TAB_TYPES: TabTypeConfig[] = [
  {
    type: 'editor',
    label: 'Code Editor',
    icon: '📝',
    component: 'editor',
  },
  {
    type: 'chat',
    label: 'Chat Interface',
    icon: '💬',
    component: 'chat',
  },
  {
    type: 'file-tree',
    label: 'File Tree',
    icon: '📁',
    component: 'file-tree',
  },
  {
    type: 'tasks',
    label: 'Task Scheduler',
    icon: '✓',
    component: 'task-scheduler',
  },
];

/**
 * Generate a UUID using crypto.randomUUID()
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Create a Tab object for a given tab type
 * 
 * @param type - The tab type to create
 * @returns A new Tab object configured for the specified type
 */
export function createTabForType(type: TabType): Tab {
  const config = TAB_TYPES.find((t) => t.type === type);
  if (!config) {
    throw new Error(`Unknown tab type: ${type}`);
  }

  const tab: Tab = {
    id: generateUUID(),
    type: 'panel',
    label: config.label,
    component: config.component,
    icon: config.icon,
  };

  return tab;
}

