import React, { useState, useRef, useEffect } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { usePanelStore } from '@/stores/panelStore';
import { createTabForType, TAB_TYPES, type TabType } from '@/utils/tabTypeHelpers';

/**
 * TabTypeDropdown component
 * Dropdown menu for opening different tab types
 */
export const TabTypeDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { createTabGroup, addTab, setActiveTab } = useTabStore();
  const { ensureMainPanelExists, getMainPanelId, getTabGroupForPanel, setPanelTabGroupMapping } = usePanelStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < TAB_TYPES.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : TAB_TYPES.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < TAB_TYPES.length) {
          handleTabTypeSelect(TAB_TYPES[selectedIndex].type);
        }
        break;
    }
  };

  const handleTabTypeSelect = async (tabType: TabType) => {
    try {
      // Ensure main panel exists
      ensureMainPanelExists();

      // Get main panel ID
      const mainPanelId = getMainPanelId();

      // Get or create tab group for main panel
      let tabGroupId = getTabGroupForPanel(mainPanelId);
      
      if (!tabGroupId) {
        tabGroupId = createTabGroup();
        setPanelTabGroupMapping(mainPanelId, tabGroupId);
      }

      // Create tab for selected type
      const newTab = createTabForType(tabType);

      // Add tab to tab group
      addTab(tabGroupId, newTab);

      // Set tab as active
      setActiveTab(tabGroupId, newTab.id);

      // Close dropdown
      setIsOpen(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to open tab:', error);
    }
  };

  return (
    <div className="relative h-full">
      {/* Menu button - Cursor style (minimal, text-based) */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          h-full px-1.5
          text-[13px] font-normal
          text-[#cccccc]
          hover:bg-[#37373d]
          rounded-[2px]
          transition-colors duration-75
          focus:outline-none
          flex items-center gap-0.5
          leading-none
          ${isOpen ? 'bg-[#37373d]' : ''}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open tab menu"
      >
        <span className="leading-[30px]">View</span>
        <svg
          width="4"
          height="4"
          viewBox="0 0 4 4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          style={{ marginTop: '1px' }}
        >
          <path
            d="M2 3L0.5 1.5H3.5L2 3Z"
            fill="currentColor"
            className="text-[#858585]"
          />
        </svg>
      </button>

      {/* Dropdown menu - Cursor style */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute top-full left-0 mt-0.5
            min-w-[220px]
            bg-[#252526]
            border border-[#3e3e42]
            shadow-[0_2px_8px_rgba(0,0,0,0.3)]
            z-50
            py-1
          `}
          role="menu"
        >
          {TAB_TYPES.map((tabTypeConfig, index) => (
            <button
              key={tabTypeConfig.type}
              onClick={() => handleTabTypeSelect(tabTypeConfig.type)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                w-full px-3 py-1 text-left
                text-[13px] font-normal
                transition-colors duration-75
                ${
                  selectedIndex === index
                    ? 'bg-[#094771] text-[#ffffff]'
                    : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                }
                focus:outline-none focus:bg-[#2a2d2e]
              `}
              role="menuitem"
            >
              <span>{tabTypeConfig.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

