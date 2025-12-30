/**
 * Settings component
 * Provides UI for configuring application settings, including editor settings
 * Designed to be displayed in a tab panel (not a modal)
 * Follows the Godot-style layout from ui-settings.md
 */

import React, { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import type { EditorSettings } from '@/types/editor';

/**
 * Settings component
 * Displays settings UI with top-level tabs, left navigation sidebar, and right content pane
 */
export const Settings: React.FC = () => {
  const { editorSettings, updateEditorSettings } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'app-settings' | 'project' | 'llm'>('app-settings');
  const [activeCategory, setActiveCategory] = useState<string>('editor');
  const [localSettings, setLocalSettings] = useState<EditorSettings>(editorSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [filterText, setFilterText] = useState('');

  const handleSettingChange = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateEditorSettings(localSettings);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalSettings(editorSettings);
    setHasChanges(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] settings-scrollbar">
      {/* Top-level Tabs */}
      <div className="flex border-b border-[#3e3e42] bg-[#252526]">
        <button
          onClick={() => setActiveTab('app-settings')}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'app-settings'
              ? 'text-[#007acc] border-b-2 border-[#007acc] bg-[#1e1e1e]'
              : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]'
          }`}
        >
          App Settings
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'project'
              ? 'text-[#007acc] border-b-2 border-[#007acc] bg-[#1e1e1e]'
              : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]'
          }`}
        >
          Project
        </button>
        <button
          onClick={() => setActiveTab('llm')}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'llm'
              ? 'text-[#007acc] border-b-2 border-[#007acc] bg-[#1e1e1e]'
              : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]'
          }`}
        >
          LLM
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 border-b border-[#3e3e42] bg-[#252526]">
        <input
          type="text"
          placeholder="Filter Settings..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full px-4 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded-md text-[#cccccc] text-sm placeholder-[#6a6a6a] focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] transition-all"
        />
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div className="w-64 border-r border-[#3e3e42] bg-[#252526] overflow-y-auto settings-scrollbar">
          {activeTab === 'app-settings' && (
            <div className="p-3">
              <div className="space-y-0.5">
                <div
                  onClick={() => setActiveCategory('application')}
                  className={`px-3 py-2.5 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                    activeCategory === 'application'
                      ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                      : 'text-[#cccccc] hover:bg-[#2d2d30]'
                  }`}
                >
                  Application
                </div>
                <div className="pl-4 space-y-0.5">
                  <div
                    onClick={() => setActiveCategory('config')}
                    className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                      activeCategory === 'config'
                        ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                        : 'text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Config
                  </div>
                  <div
                    onClick={() => setActiveCategory('editor')}
                    className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                      activeCategory === 'editor'
                        ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                        : 'text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Editor
                  </div>
                  <div
                    onClick={() => setActiveCategory('general')}
                    className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                      activeCategory === 'general'
                        ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                        : 'text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    General
                  </div>
                </div>
                <div
                  onClick={() => setActiveCategory('appearance')}
                  className={`px-3 py-2.5 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                    activeCategory === 'appearance'
                      ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                      : 'text-[#cccccc] hover:bg-[#2d2d30]'
                  }`}
                >
                  Appearance
                </div>
                <div className="pl-4 space-y-0.5">
                  <div
                    onClick={() => setActiveCategory('theme')}
                    className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                      activeCategory === 'theme'
                        ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                        : 'text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Theme
                  </div>
                  <div
                    onClick={() => setActiveCategory('font')}
                    className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-all duration-150 ${
                      activeCategory === 'font'
                        ? 'bg-[#37373d] border-l-2 border-[#007acc] text-[#ffffff]'
                        : 'text-[#cccccc] hover:bg-[#2d2d30]'
                    }`}
                  >
                    Font
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'project' && (
            <div className="p-2">
              <p className="text-sm text-[#858585] px-3 py-2">No project open</p>
            </div>
          )}
          {activeTab === 'llm' && (
            <div className="p-2">
              <p className="text-sm text-[#858585] px-3 py-2">LLM settings coming soon</p>
            </div>
          )}
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          <div className="flex-1 overflow-y-auto p-8 settings-scrollbar">
            {activeTab === 'app-settings' && activeCategory === 'editor' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h3 className="text-xl font-semibold text-[#ffffff] mb-1">Editor Settings</h3>
                  <p className="text-sm text-[#858585]">Configure the code editor appearance and behavior</p>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#cccccc]">
                      Font Size
                    </label>
                    <span className="text-sm text-[#858585] font-mono">{localSettings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={localSettings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#3c3c3c] rounded-full appearance-none cursor-pointer accent-[#007acc]"
                    style={{
                      background: `linear-gradient(to right, #007acc 0%, #007acc ${((localSettings.fontSize - 8) / (32 - 8)) * 100}%, #3c3c3c ${((localSettings.fontSize - 8) / (32 - 8)) * 100}%, #3c3c3c 100%)`
                    }}
                  />
                </div>

                {/* Word Wrap */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#cccccc]">Word Wrap</label>
                  <select
                    value={localSettings.wordWrap}
                    onChange={(e) => handleSettingChange('wordWrap', e.target.value as EditorSettings['wordWrap'])}
                    className="w-full px-4 py-2.5 bg-[#3c3c3c] border border-[#3e3e42] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] transition-all cursor-pointer"
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                    <option value="wordWrapColumn">Word Wrap Column</option>
                    <option value="bounded">Bounded</option>
                  </select>
                </div>

                {/* Minimap */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <label className="block text-sm font-medium text-[#cccccc]">Show Minimap</label>
                    <p className="text-xs text-[#858585] mt-0.5">Display a minimap in the editor</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('minimap', { enabled: !localSettings.minimap.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      localSettings.minimap.enabled ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        localSettings.minimap.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Line Numbers */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#cccccc]">Line Numbers</label>
                  <select
                    value={localSettings.lineNumbers}
                    onChange={(e) => handleSettingChange('lineNumbers', e.target.value as EditorSettings['lineNumbers'])}
                    className="w-full px-4 py-2.5 bg-[#3c3c3c] border border-[#3e3e42] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] transition-all cursor-pointer"
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                    <option value="relative">Relative</option>
                  </select>
                </div>

                {/* Tab Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#cccccc]">
                      Tab Size
                    </label>
                    <span className="text-sm text-[#858585] font-mono">{localSettings.tabSize} spaces</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={localSettings.tabSize}
                    onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#3c3c3c] rounded-full appearance-none cursor-pointer accent-[#007acc]"
                    style={{
                      background: `linear-gradient(to right, #007acc 0%, #007acc ${((localSettings.tabSize - 1) / (8 - 1)) * 100}%, #3c3c3c ${((localSettings.tabSize - 1) / (8 - 1)) * 100}%, #3c3c3c 100%)`
                    }}
                  />
                </div>

                {/* Insert Spaces */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <label className="block text-sm font-medium text-[#cccccc]">Insert Spaces</label>
                    <p className="text-xs text-[#858585] mt-0.5">Use spaces instead of tab characters</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('insertSpaces', !localSettings.insertSpaces)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      localSettings.insertSpaces ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        localSettings.insertSpaces ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#cccccc]">Theme</label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#3c3c3c] border border-[#3e3e42] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] transition-all cursor-pointer"
                  >
                    <option value="vs-dark">Dark</option>
                    <option value="vs-light">Light</option>
                    <option value="hc-black">High Contrast Dark</option>
                    <option value="hc-light">High Contrast Light</option>
                  </select>
                </div>

                {/* Render Whitespace */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#cccccc]">Render Whitespace</label>
                  <select
                    value={localSettings.renderWhitespace || 'none'}
                    onChange={(e) => handleSettingChange('renderWhitespace', e.target.value as EditorSettings['renderWhitespace'])}
                    className="w-full px-4 py-2.5 bg-[#3c3c3c] border border-[#3e3e42] rounded-md text-[#cccccc] text-sm focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] transition-all cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="boundary">Boundary</option>
                    <option value="selection">Selection</option>
                    <option value="all">All</option>
                  </select>
                </div>

                {/* Format on Paste */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <label className="block text-sm font-medium text-[#cccccc]">Format on Paste</label>
                    <p className="text-xs text-[#858585] mt-0.5">Automatically format code when pasting</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('formatOnPaste', !(localSettings.formatOnPaste ?? true))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      localSettings.formatOnPaste !== false ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        localSettings.formatOnPaste !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Format on Type */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <label className="block text-sm font-medium text-[#cccccc]">Format on Type</label>
                    <p className="text-xs text-[#858585] mt-0.5">Automatically format code as you type</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('formatOnType', !(localSettings.formatOnType ?? true))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      localSettings.formatOnType !== false ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        localSettings.formatOnType !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'app-settings' && activeCategory !== 'editor' && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h3 className="text-xl font-semibold text-[#ffffff] mb-1">
                    {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Settings
                  </h3>
                  <p className="text-sm text-[#858585]">Settings for this category will be available in a future update.</p>
                </div>
              </div>
            )}

            {activeTab === 'project' && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h3 className="text-xl font-semibold text-[#ffffff] mb-1">Project Settings</h3>
                  <p className="text-sm text-[#858585]">No project is currently open. Project settings will be available when a project is loaded.</p>
                </div>
              </div>
            )}

            {activeTab === 'llm' && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h3 className="text-xl font-semibold text-[#ffffff] mb-1">LLM Settings</h3>
                  <p className="text-sm text-[#858585]">LLM settings will be available in a future update.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Save/Cancel buttons */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#3e3e42] bg-[#252526]">
            <button
              onClick={handleCancel}
              disabled={!hasChanges}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                hasChanges
                  ? 'text-[#cccccc] hover:bg-[#3e3e42] hover:text-[#ffffff]'
                  : 'text-[#6a6a6a] cursor-not-allowed'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                hasChanges
                  ? 'bg-[#007acc] text-white hover:bg-[#005a9e] shadow-sm'
                  : 'bg-[#3c3c3c] text-[#6a6a6a] cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
