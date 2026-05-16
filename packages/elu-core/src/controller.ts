import { dispatchClosed, dispatchOpen, type KeyDispatch } from './keyboard';

const TYPEAHEAD_RESET_MS = 500;

interface BootOptions {
  root: HTMLElement;
}

export class EluController {
  private root: HTMLElement;
  private trigger: HTMLButtonElement;
  private content: HTMLElement;
  private viewport: HTMLElement | null;
  private items: HTMLElement[];
  private searchInput: HTMLInputElement | null;
  private valueEl: HTMLElement | null;
  private formInputsHost: HTMLElement;

  private multiple: boolean;
  private disabled: boolean;
  private required: boolean;
  private name: string | undefined;
  private placeholder: string;

  private selected = new Set<string>();
  private defaultSelected: string[];
  private highlightIndex = -1;
  private isOpen = false;
  private closeSource: 'programmatic' | 'external' = 'external';

  private typeaheadBuffer = '';
  private typeaheadTimer: number | null = null;

  private searchDebounceMs = 0;
  private searchDebounceTimer: number | null = null;

  private baseId: string;
  private useAnchorFallback = false;

  private itemsObserver: MutationObserver | null = null;
  private pendingRefresh = false;

  constructor({ root }: BootOptions) {
    this.root = root;

    const trigger = root.querySelector<HTMLButtonElement>('[data-elu-trigger]');
    const content = root.querySelector<HTMLElement>('[data-elu-content]');
    if (!trigger || !content) {
      throw new Error('[elu] Root requires both Trigger and Content children');
    }
    this.trigger = trigger;
    this.content = content;
    this.viewport = root.querySelector<HTMLElement>('[data-elu-viewport]');
    this.items = Array.from(root.querySelectorAll<HTMLElement>('[data-elu-item]'));
    this.searchInput = root.querySelector<HTMLInputElement>('[data-elu-search] input');
    this.valueEl = root.querySelector<HTMLElement>('[data-elu-value]');
    this.formInputsHost = root.querySelector<HTMLElement>('[data-elu-form-inputs]') ?? this.createFormInputsHost();

    this.multiple = root.dataset.multiple === 'true';
    this.disabled = root.dataset.disabled === 'true';
    this.required = root.dataset.required === 'true';
    this.name = root.dataset.name || undefined;
    this.placeholder = this.valueEl?.dataset.placeholder ?? '';
    this.searchDebounceMs = Number(this.searchInput?.dataset.debounceMs ?? 0);

    this.defaultSelected = this.parseInitial(root.dataset.valueInitial);
    this.defaultSelected.forEach((v) => this.selected.add(v));

    this.baseId = root.id || `es-${Math.random().toString(36).slice(2, 9)}`;
    root.id = this.baseId;
    this.assignIds();
    this.applyAriaRoles();
    this.applyAnchorPositioning();

    this.syncSelectedAttrs();
    this.updateValueDisplay();
    this.rebuildFormInputs();

    this.wireEvents();

    // MutationObserver: auto-refresh when items are dynamically added/removed
    // (used by React and other frameworks that mutate the DOM after mount).
    // Uses queueMicrotask to batch all mutations in one tick into a single refresh.
    if (this.viewport) {
      this.itemsObserver = new MutationObserver(() => {
        if (!this.pendingRefresh) {
          this.pendingRefresh = true;
          queueMicrotask(() => {
            this.pendingRefresh = false;
            this.refresh();
          });
        }
      });
      this.itemsObserver.observe(this.viewport, { childList: true, subtree: true });
    }
  }

  destroy(): void {
    this.itemsObserver?.disconnect();
    this.itemsObserver = null;
    this.trigger.removeEventListener('click', this.onTriggerClick);
    this.trigger.removeEventListener('keydown', this.onTriggerKeydown);
    this.content.removeEventListener('keydown', this.onContentKeydown);
    this.content.removeEventListener('toggle', this.onToggle as EventListener);
    this.content.removeEventListener('mouseleave', this.onContentMouseLeave);
    this.content.removeEventListener('mouseover', this.onContentMouseOver);
    this.items.forEach((it) => {
      it.removeEventListener('click', this.onItemClick);
    });
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.onSearchInput);
    }
    if (this.typeaheadTimer != null) window.clearTimeout(this.typeaheadTimer);
    if (this.searchDebounceTimer != null) window.clearTimeout(this.searchDebounceTimer);
    const form = this.trigger.closest('form');
    if (form) form.removeEventListener('reset', this.onFormReset);
    if (this.useAnchorFallback) {
      window.removeEventListener('scroll', this.repositionFallback, true);
      window.removeEventListener('resize', this.repositionFallback);
    }
  }

  /** Re-query items from the DOM and re-wire their event listeners.           */
  /** Called automatically by MutationObserver; can also be called manually.  */
  refresh(): void {
    // Temporarily disconnect observer to avoid re-entrant calls during our own
    // DOM mutations (aria attribute assignments below).
    this.itemsObserver?.disconnect();

    this.items.forEach((it) => it.removeEventListener('click', this.onItemClick));
    this.items = Array.from(this.root.querySelectorAll<HTMLElement>('[data-elu-item]'));

    if (this.highlightIndex >= this.items.length) {
      this.highlightIndex = -1;
      this.trigger.removeAttribute('aria-activedescendant');
      this.searchInput?.removeAttribute('aria-activedescendant');
    }

    this.items.forEach((it, i) => {
      it.id = `${this.baseId}-item-${i}`;
      it.setAttribute('role', 'option');
      it.setAttribute('tabindex', '-1');
      if (it.dataset.disabled === 'true') it.setAttribute('aria-disabled', 'true');
      it.addEventListener('click', this.onItemClick);
    });

    this.syncSelectedAttrs();
    this.updateValueDisplay();

    // Re-connect observer after our own mutations are done.
    if (this.viewport && this.itemsObserver) {
      this.itemsObserver.observe(this.viewport, { childList: true, subtree: true });
    }
  }

  // ── setup ────────────────────────────────────────────────────────────────

  private createFormInputsHost(): HTMLElement {
    const host = document.createElement('span');
    host.setAttribute('data-elu-form-inputs', '');
    host.style.display = 'none';
    this.root.appendChild(host);
    return host;
  }

  private parseInitial(raw: string | undefined): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
      if (parsed != null) return [String(parsed)];
    } catch {}
    return [];
  }

  private assignIds(): void {
    this.trigger.id = `${this.baseId}-trigger`;
    this.content.id = `${this.baseId}-content`;
    if (this.viewport) this.viewport.id = `${this.baseId}-viewport`;
    this.items.forEach((it, i) => {
      it.id = `${this.baseId}-item-${i}`;
    });
    if (this.searchInput) {
      this.searchInput.id = `${this.baseId}-search`;
      this.searchInput.setAttribute('aria-controls', this.content.id);
    }
    const groupLabels = this.root.querySelectorAll<HTMLElement>('[data-elu-group-label]');
    groupLabels.forEach((label, i) => {
      const id = `${this.baseId}-group-${i}`;
      label.id = id;
      const group = label.closest<HTMLElement>('[data-elu-group]');
      if (group) group.setAttribute('aria-labelledby', id);
    });
  }

  private applyAriaRoles(): void {
    this.trigger.setAttribute('aria-haspopup', 'listbox');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-controls', this.content.id);
    if (!this.searchInput) this.trigger.setAttribute('role', 'combobox');
    if (this.required) this.trigger.setAttribute('aria-required', 'true');
    if (this.disabled) this.trigger.setAttribute('aria-disabled', 'true');
    // `popovertarget` makes the browser treat trigger click as a native toggle,
    // which avoids the light-dismiss + click race that would otherwise reopen
    // the popover on click while open. Skip when disabled so it stays inert.
    if (!this.disabled) {
      this.trigger.setAttribute('popovertarget', this.content.id);
    }

    this.content.setAttribute('role', 'listbox');
    if (this.multiple) this.content.setAttribute('aria-multiselectable', 'true');
    this.content.setAttribute('aria-labelledby', this.trigger.id);

    if (this.searchInput) {
      this.searchInput.setAttribute('role', 'combobox');
      this.searchInput.setAttribute('aria-haspopup', 'listbox');
      this.searchInput.setAttribute('aria-autocomplete', 'list');
      this.searchInput.setAttribute('aria-expanded', 'false');
      this.searchInput.setAttribute('aria-controls', this.content.id);
    }

    this.items.forEach((it) => {
      it.setAttribute('role', 'option');
      it.setAttribute('tabindex', '-1');
      if (it.dataset.disabled === 'true') it.setAttribute('aria-disabled', 'true');
    });

    const separators = this.root.querySelectorAll('[data-elu-separator]');
    separators.forEach((s) => s.setAttribute('role', 'separator'));
  }

  private applyAnchorPositioning(): void {
    const supports = typeof CSS !== 'undefined' && CSS.supports?.('anchor-name', '--x');
    this.useAnchorFallback = !supports;
    if (supports) {
      const anchorName = `--anchor-${this.baseId}`;
      this.trigger.style.setProperty('anchor-name', anchorName);
      this.content.style.setProperty('position-anchor', anchorName);
    }
    this.applySideAlignAttrs();
  }

  private applySideAlignAttrs(): void {
    const side = (this.content.dataset.side as 'top' | 'bottom') || 'bottom';
    const align = (this.content.dataset.align as 'start' | 'center' | 'end') || 'start';
    this.content.dataset.side = side;
    this.content.dataset.align = align;
  }

  private wireEvents(): void {
    this.trigger.addEventListener('click', this.onTriggerClick);
    this.trigger.addEventListener('keydown', this.onTriggerKeydown);
    this.content.addEventListener('keydown', this.onContentKeydown);
    this.content.addEventListener('toggle', this.onToggle as EventListener);
    this.content.addEventListener('mouseleave', this.onContentMouseLeave);
    this.content.addEventListener('mouseover', this.onContentMouseOver);
    this.items.forEach((it) => {
      it.addEventListener('click', this.onItemClick);
    });
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.onSearchInput);
    }
    const form = this.trigger.closest('form');
    if (form) form.addEventListener('reset', this.onFormReset);
    if (this.useAnchorFallback) {
      window.addEventListener('scroll', this.repositionFallback, true);
      window.addEventListener('resize', this.repositionFallback);
    }
  }

  // ── events ───────────────────────────────────────────────────────────────

  private pendingOpenAction: 'first' | 'last' | null = null;
  private pendingTypeaheadKey: string | null = null;

  private onTriggerClick = (e: MouseEvent) => {
    // popovertarget handles toggle natively. Block clicks when disabled so the
    // browser does not toggle the inert popover.
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  private onTriggerKeydown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    if (this.isOpen) {
      // Search owns key handling when present (it has focus).
      if (!this.searchInput) {
        this.handleDispatch(dispatchOpen(e, false, this.multiple), e);
      }
      return;
    }
    const d = dispatchClosed(e);
    if (d.action === 'noop') return;
    // Enter / Space: let the native button click + popovertarget open the
    // popover. ArrowDown/Up/Home/End/printable: open manually and stash the
    // follow-up action so onToggle can apply it after the popover is open.
    if (e.key === 'Enter' || e.key === ' ') {
      this.pendingOpenAction = 'first';
      return;
    }
    e.preventDefault();
    if (e.key === 'ArrowDown' || e.key === 'Home') {
      this.pendingOpenAction = 'first';
    } else if (e.key === 'ArrowUp' || e.key === 'End') {
      this.pendingOpenAction = 'last';
    } else if (d.key) {
      this.pendingTypeaheadKey = d.key;
    }
    this.open();
  };

  private onContentKeydown = (e: KeyboardEvent) => {
    if (!this.isOpen) return;
    const searchFocused = !!this.searchInput && document.activeElement === this.searchInput;
    this.handleDispatch(dispatchOpen(e, searchFocused, this.multiple), e);
  };

  private handleDispatch(d: KeyDispatch, e: KeyboardEvent): void {
    switch (d.action) {
      case 'next':
        e.preventDefault();
        this.highlightDelta(1);
        break;
      case 'prev':
        e.preventDefault();
        this.highlightDelta(-1);
        break;
      case 'first':
        e.preventDefault();
        this.highlightFirstEnabled();
        break;
      case 'last':
        e.preventDefault();
        this.highlightLastEnabled();
        break;
      case 'select':
        e.preventDefault();
        this.commitHighlight(false);
        break;
      case 'select-stay':
        e.preventDefault();
        this.commitHighlight(true);
        break;
      case 'close':
        e.preventDefault();
        this.close();
        break;
      case 'tab':
        this.close();
        break;
      case 'typeahead':
        if (d.key) {
          e.preventDefault();
          this.typeahead(d.key);
        }
        break;
      case 'backspace-multi':
        if (this.selected.size > 0) {
          const last = Array.from(this.selected).pop()!;
          this.selected.delete(last);
          this.afterSelectionChange();
        }
        break;
    }
  }

  private onItemClick = (e: MouseEvent) => {
    const item = e.currentTarget as HTMLElement;
    if (item.dataset.disabled === 'true') return;
    const idx = this.items.indexOf(item);
    this.highlightIndex = idx;
    this.commitHighlight(this.multiple);
  };

  private onContentMouseLeave = () => {
    this.clearHighlight();
  };

  private onContentMouseOver = (e: MouseEvent) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('[data-elu-item]');
    if (!item || item.dataset.disabled === 'true') {
      this.clearHighlight();
    } else {
      this.highlightItem(this.items.indexOf(item));
    }
  };

  private onSearchInput = () => {
    if (this.searchDebounceMs > 0) {
      if (this.searchDebounceTimer != null) window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = window.setTimeout(() => {
        this.searchDebounceTimer = null;
        this.applySearch();
      }, this.searchDebounceMs);
    } else {
      this.applySearch();
    }
  };

  private applySearch(): void {
    if (!this.searchInput) return;
    const q = normalize(this.searchInput.value);
    let firstVisible = -1;
    this.items.forEach((it, i) => {
      const text = normalize(it.dataset.textValue || it.textContent || '');
      const hidden = q.length > 0 && !text.includes(q);
      it.hidden = hidden;
      if (!hidden && firstVisible === -1) firstVisible = i;
    });
    if (firstVisible !== -1) this.highlightItem(firstVisible);
    else this.clearHighlight();
  }

  private onToggle = (e: ToggleEvent) => {
    if (e.newState === 'open') {
      this.isOpen = true;
      this.root.dataset.state = 'open';
      this.trigger.setAttribute('aria-expanded', 'true');
      if (this.searchInput) this.searchInput.setAttribute('aria-expanded', 'true');
      if (this.useAnchorFallback) this.repositionFallback();
      if (this.searchInput) this.searchInput.focus();
      if (this.pendingOpenAction === 'first') this.highlightFirstEnabled();
      else if (this.pendingOpenAction === 'last') this.highlightLastEnabled();
      if (this.pendingTypeaheadKey) this.typeahead(this.pendingTypeaheadKey);
      this.pendingOpenAction = null;
      this.pendingTypeaheadKey = null;
    } else {
      this.isOpen = false;
      this.root.dataset.state = 'closed';
      this.trigger.setAttribute('aria-expanded', 'false');
      if (this.searchDebounceTimer != null) {
        window.clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = null;
      }
      if (this.searchInput) {
        this.searchInput.setAttribute('aria-expanded', 'false');
        this.searchInput.value = '';
        this.items.forEach((it) => (it.hidden = false));
      }
      this.clearHighlight();
      const wasProgrammatic = this.closeSource === 'programmatic';
      this.closeSource = 'external';
      if (wasProgrammatic) this.trigger.focus();
    }
  };

  private onFormReset = () => {
    this.selected.clear();
    this.defaultSelected.forEach((v) => this.selected.add(v));
    if (this.searchInput) {
      this.searchInput.value = '';
      this.items.forEach((it) => (it.hidden = false));
    }
    this.afterSelectionChange();
  };

  // ── popover control ──────────────────────────────────────────────────────

  private open(): void {
    if (this.isOpen || this.disabled) return;
    this.content.showPopover();
  }

  private close(): void {
    if (!this.isOpen) return;
    this.closeSource = 'programmatic';
    this.content.hidePopover();
  }

  // ── highlight / selection ────────────────────────────────────────────────

  private firstEnabledIndex(): number {
    return this.items.findIndex((it) => it.dataset.disabled !== 'true' && !it.hidden);
  }

  private lastEnabledIndex(): number {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.dataset.disabled !== 'true' && !it.hidden) return i;
    }
    return -1;
  }

  private highlightFirstEnabled(): void {
    this.highlightItem(this.firstEnabledIndex());
  }

  private highlightLastEnabled(): void {
    this.highlightItem(this.lastEnabledIndex());
  }

  private highlightDelta(delta: number): void {
    if (this.items.length === 0) return;
    const enabled = this.items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.dataset.disabled !== 'true' && !it.hidden);
    if (enabled.length === 0) return;
    const currentEnabledIdx = enabled.findIndex(({ i }) => i === this.highlightIndex);
    let next = currentEnabledIdx + delta;
    if (next < 0) next = enabled.length - 1;
    if (next >= enabled.length) next = 0;
    this.highlightItem(enabled[next].i);
  }

  private highlightItem(index: number): void {
    if (index < 0 || index >= this.items.length) {
      this.clearHighlight();
      return;
    }
    if (this.highlightIndex === index) return;
    if (this.highlightIndex >= 0) {
      this.items[this.highlightIndex]?.removeAttribute('data-highlighted');
    }
    this.highlightIndex = index;
    const item = this.items[index];
    item.dataset.highlighted = 'true';
    const id = item.id;
    // Only the focused element should advertise activedescendant.
    if (this.searchInput) {
      this.searchInput.setAttribute('aria-activedescendant', id);
      this.trigger.removeAttribute('aria-activedescendant');
    } else {
      this.trigger.setAttribute('aria-activedescendant', id);
    }
    item.scrollIntoView({ block: 'nearest' });
  }

  private clearHighlight(): void {
    if (this.highlightIndex >= 0) {
      this.items[this.highlightIndex]?.removeAttribute('data-highlighted');
    }
    this.highlightIndex = -1;
    this.trigger.removeAttribute('aria-activedescendant');
    this.searchInput?.removeAttribute('aria-activedescendant');
  }

  private commitHighlight(staysOpen: boolean): void {
    if (this.highlightIndex < 0) return;
    const item = this.items[this.highlightIndex];
    if (item.dataset.disabled === 'true') return;
    const value = item.dataset.value;
    if (value == null) return;
    if (this.multiple) {
      if (this.selected.has(value)) this.selected.delete(value);
      else this.selected.add(value);
    } else {
      this.selected.clear();
      this.selected.add(value);
    }
    this.afterSelectionChange();
    if (!staysOpen) this.close();
  }

  private afterSelectionChange(emit = true): void {
    this.syncSelectedAttrs();
    this.updateValueDisplay();
    this.rebuildFormInputs();
    if (!emit) return;
    this.root.dispatchEvent(
      new CustomEvent('elu:change', {
        bubbles: true,
        detail: {
          value: this.multiple ? Array.from(this.selected) : (Array.from(this.selected)[0] ?? ''),
          multiple: this.multiple,
        },
      }),
    );
  }

  /** Programmatic selection update. Pass `{ silent: true }` to skip the      */
  /** `elu:change` event — useful when reconciling from external state.        */
  setValue(next: string | string[], options: { silent?: boolean } = {}): void {
    const values = Array.isArray(next) ? next : next === '' ? [] : [next];
    this.selected.clear();
    if (this.multiple) {
      values.forEach((v) => this.selected.add(v));
    } else if (values.length > 0) {
      this.selected.add(values[0]);
    }
    this.afterSelectionChange(!options.silent);
  }

  private syncSelectedAttrs(): void {
    this.items.forEach((it) => {
      const v = it.dataset.value;
      const isSelected = v != null && this.selected.has(v);
      it.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) it.dataset.selected = 'true';
      else delete it.dataset.selected;
    });
  }

  private updateValueDisplay(): void {
    if (!this.valueEl) return;
    const values = Array.from(this.selected);
    if (values.length === 0) {
      this.valueEl.textContent = this.placeholder;
      this.valueEl.dataset.empty = 'true';
      return;
    }
    delete this.valueEl.dataset.empty;
    const labels = values
      .map((v) => this.items.find((it) => it.dataset.value === v))
      .filter((it): it is HTMLElement => it != null)
      .map((it) => (it.dataset.textValue || it.textContent || '').trim());
    if (!this.multiple) {
      this.valueEl.textContent = labels[0] ?? values[0];
      return;
    }
    if (labels.length === 1) this.valueEl.textContent = labels[0];
    else if (labels.length === 2) this.valueEl.textContent = `${labels[0]}, ${labels[1]}`;
    else this.valueEl.textContent = `${labels.length} selected`;
  }

  private rebuildFormInputs(): void {
    // Native <select disabled> is excluded from form submission; mirror that.
    if (!this.name || this.disabled) {
      this.formInputsHost.replaceChildren();
      return;
    }
    const inputs: HTMLInputElement[] = [];
    const values = Array.from(this.selected);
    if (values.length === 0 && this.required) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = this.name;
      input.value = '';
      input.required = true;
      inputs.push(input);
    } else {
      values.forEach((v) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = this.name!;
        input.value = v;
        if (this.required) input.required = true;
        inputs.push(input);
      });
    }
    this.formInputsHost.replaceChildren(...inputs);
  }

  // ── typeahead ────────────────────────────────────────────────────────────

  private typeahead(key: string): void {
    if (this.typeaheadTimer != null) window.clearTimeout(this.typeaheadTimer);
    this.typeaheadBuffer += key.toLowerCase();
    const buffer = this.typeaheadBuffer;
    const idx = this.items.findIndex((it) => {
      if (it.dataset.disabled === 'true' || it.hidden) return false;
      const text = normalize(it.dataset.textValue || it.textContent || '');
      return text.startsWith(buffer);
    });
    if (idx !== -1) this.highlightItem(idx);
    this.typeaheadTimer = window.setTimeout(() => {
      this.typeaheadBuffer = '';
      this.typeaheadTimer = null;
    }, TYPEAHEAD_RESET_MS);
  }

  // ── anchor positioning fallback (Firefox) ────────────────────────────────

  private repositionFallback = () => {
    if (!this.useAnchorFallback || !this.isOpen) return;
    const triggerRect = this.trigger.getBoundingClientRect();
    const sideOffset = Number(this.content.dataset.sideOffset || 4);
    const collisionPadding = Number(this.content.dataset.collisionPadding || 8);
    const align = (this.content.dataset.align as 'start' | 'center' | 'end') || 'start';
    const side = (this.content.dataset.side as 'top' | 'bottom') || 'bottom';
    const contentRect = this.content.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    let top = side === 'bottom'
      ? triggerRect.bottom + sideOffset
      : triggerRect.top - contentRect.height - sideOffset;
    let left = triggerRect.left;
    if (align === 'center') left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    if (align === 'end') left = triggerRect.right - contentRect.width;

    left = Math.max(collisionPadding, Math.min(left, vw - contentRect.width - collisionPadding));
    top = Math.max(collisionPadding, Math.min(top, vh - contentRect.height - collisionPadding));

    this.content.style.position = 'fixed';
    this.content.style.margin = '0';
    this.content.style.top = `${top}px`;
    this.content.style.left = `${left}px`;
  };
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function bootElu(): void {
  document.querySelectorAll<HTMLElement>('[data-elu-root]:not([data-elu-booted])').forEach((root) => {
    root.dataset.eluBooted = 'true';
    try {
      const inst = new EluController({ root });
      (root as unknown as { __eluInstance: EluController }).__eluInstance = inst;
    } catch (err) {
      console.error('[elu]', err);
    }
  });
}
