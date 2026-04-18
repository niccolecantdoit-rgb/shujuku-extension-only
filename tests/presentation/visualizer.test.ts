import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCloseWindow, mockCreateWindow, mockResetAssistantState } = vi.hoisted(() => ({
  mockCloseWindow: vi.fn(),
  mockCreateWindow: vi.fn(),
  mockResetAssistantState: vi.fn(),
}));

vi.mock('../../src/presentation/pages/visualizer-main-render', () => ({
  renderVisualizerMain_ACU: vi.fn(),
}));

vi.mock('../../src/presentation/pages/visualizer-main-save', () => ({
  saveVisualizerChanges_ACU: vi.fn(),
}));

vi.mock('../../src/presentation/pages/visualizer-sidebar', () => ({
  renderVisualizerSidebar_ACU: vi.fn(),
}));

vi.mock('../../src/presentation/theme/toast', () => ({
  showToastr_ACU: vi.fn(),
}));

vi.mock('../../src/presentation/window/window-styles', () => ({
  toggleACUTheme_ACU: vi.fn(() => 'ink'),
}));

vi.mock('../../src/presentation/window/window-system', () => ({
  closeACUWindow: mockCloseWindow,
  createACUWindow: mockCreateWindow,
  ACU_WindowManager: { isOpen: vi.fn(() => false) },
}));

vi.mock('../../src/presentation/dom-utils', () => ({
  jQuery_API_ACU: vi.fn(() => ({
    length: 0,
    text: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    find: vi.fn(() => ({ on: vi.fn(), removeClass: vi.fn(), addClass: vi.fn(), text: vi.fn() })),
    addClass: vi.fn(),
    removeClass: vi.fn(),
    data: vi.fn(),
  })),
}));

vi.mock('../../src/service/runtime/state-manager', () => ({
  currentJsonTableData_ACU: {
    mate: { type: 'chatSheets', version: 1 },
    sheet_b: { uid: 'sheet_b', name: 'B表', orderNo: 1 },
    sheet_a: { uid: 'sheet_a', name: 'A表', orderNo: 0 },
  },
  _set_currentJsonTableData_ACU: vi.fn(),
}));

vi.mock('../../src/service/template/chat-scope', () => ({
  getSortedSheetKeys_ACU: vi.fn((data: any) => Object.keys(data || {}).filter((key) => key.startsWith('sheet_')).sort((a, b) => (data[a]?.orderNo ?? 0) - (data[b]?.orderNo ?? 0))),
  reorderDataBySheetKeys_ACU: vi.fn((data: any) => data),
}));

vi.mock('../../src/service/worldbook/pipeline', () => ({
  loadAllChatMessages_ACU: vi.fn(),
}));

vi.mock('../../src/shared/constants', () => ({
  SCRIPT_ID_PREFIX_ACU: 'acu',
}));

vi.mock('../../src/shared/html-helpers', () => ({
  escapeHtml_ACU: vi.fn((value: string) => value),
}));

vi.mock('../../src/shared/utils', () => ({
  logDebug_ACU: vi.fn(),
  logWarn_ACU: vi.fn(),
}));

vi.mock('../../src/service/template/template-preset-service', () => ({
  getActiveTemplatePresetMeta_ACU: vi.fn(() => ({ displayName: '默认模板', scopeLabel: '当前聊天' })),
}));

vi.mock('../../src/service/runtime/helpers-remaining', () => ({
  mergeAllIndependentTables_ACU: vi.fn(),
}));

vi.mock('../../src/presentation/pages/visualizer-styles', () => ({
  VISUALIZER_CSS_ACU: '.acu{}',
}));

vi.mock('../../src/presentation/pages/visualizer-template-assistant', () => ({
  renderVisualizerTemplateAssistantPanel_ACU: vi.fn(),
  resetVisualizerTemplateAssistantState_ACU: mockResetAssistantState,
  toggleVisualizerTemplateAssistant_ACU: vi.fn(),
}));

describe('openNewVisualizer_ACU', () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as any).window = {};
    mockCloseWindow.mockReset();
    mockCreateWindow.mockReset();
    mockResetAssistantState.mockReset();
  });

  it('打开窗口时重置跨会话状态并清空 assistant 局部状态', async () => {
    const { _acuVisState, openNewVisualizer_ACU } = await import('../../src/presentation/pages/visualizer');
    _acuVisState.tempData = null;
    _acuVisState.currentSheetKey = 'stale_sheet';
    _acuVisState.mode = 'globalConfig';
    _acuVisState.sheetOrder = ['stale_sheet'];
    _acuVisState.deletedSheetKeys = ['sheet_deleted'];

    openNewVisualizer_ACU();

    expect(_acuVisState.currentSheetKey).toBe('sheet_a');
    expect(_acuVisState.mode).toBe('data');
    expect(_acuVisState.sheetOrder).toBeNull();
    expect(_acuVisState.deletedSheetKeys).toEqual([]);
    expect(mockResetAssistantState).toHaveBeenCalledTimes(1);
    expect(mockCloseWindow).toHaveBeenCalledTimes(1);
    expect(mockCreateWindow).toHaveBeenCalledTimes(1);
  });
});
