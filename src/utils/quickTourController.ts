import {
  computeTourCardPosition,
  getNextStepIndex,
  getPrevStepIndex,
  getTourProgressPercent,
  getTourSteps,
  getTourUiStrings,
  type Rect,
  type TourLang,
  type TourRoleContext,
  type TourStep,
} from './quickTourLogic';

declare global {
  interface Window {
    startQuickTour?: (source?: 'principal' | 'master') => void;
    closeQuickTour?: (restoreOrigin?: boolean) => void;
    demoMode?: boolean;
    switchWorkspace?: (view: string) => void;
    switchPrincipalTab?: (tab: string) => void;
    showToast?: (msg: string) => void;
  }
}

interface TourOriginState {
  view: string;
  principalTab: string;
  triggerEl: HTMLElement | null;
}

class QuickTourController {
  private isOpen = false;
  private steps: TourStep[] = [];
  private stepIndex = 0;
  private lang: TourLang = 'ml';
  private origin: TourOriginState | null = null;
  private rootEl: HTMLDivElement | null = null;
  private spotlightEl: HTMLDivElement | null = null;
  private cardEl: HTMLDivElement | null = null;
  private arrowEl: HTMLDivElement | null = null;
  private repositionTimer: number | null = null;
  private rafId: number | null = null;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundReposition: () => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundReposition = this.schedulePositionUpdate.bind(this);
  }

  private detectInitialLang(): TourLang {
    const docLang = document.documentElement.getAttribute('data-app-lang');
    if (docLang === 'en' || docLang === 'ml') return docLang;
    const select = document.getElementById('header-lang-select') as HTMLSelectElement | null;
    if (select && (select.value === 'en' || select.value === 'ml')) return select.value;
    try {
      const saved = localStorage.getItem('hifz_app_language');
      if (saved === 'en' || saved === 'ml') return saved;
    } catch {
      // Ignore storage access failures
    }
    return 'ml';
  }

  private detectRoleContext(source?: 'principal' | 'master'): TourRoleContext {
    if (source === 'master') return 'master';
    const masterSection = document.getElementById('view-master');
    if (masterSection && !masterSection.classList.contains('hidden')) {
      return 'master';
    }
    if (window.demoMode === true) {
      return 'principal_demo';
    }
    return 'principal';
  }

  private captureOriginState(): TourOriginState {
    let activeView = 'principal';
    const views = ['master', 'principal', 'analytics', 'teacher', 'schedules', 'parent'];
    for (const v of views) {
      const sec = document.getElementById(`view-${v}`);
      if (sec && !sec.classList.contains('hidden')) {
        activeView = v;
        break;
      }
    }

    let activePrincipalTab = 'portfolios';
    const pTabs = ['portfolios', 'enroll', 'notices', 'settings'];
    for (const pt of pTabs) {
      const tabEl = document.getElementById(`p-tab-${pt}`);
      if (tabEl && !tabEl.classList.contains('hidden')) {
        activePrincipalTab = pt;
        break;
      }
    }

    return {
      view: activeView,
      principalTab: activePrincipalTab,
      triggerEl: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    };
  }

  private restoreOriginState(): void {
    if (!this.origin) return;
    const { view, principalTab, triggerEl } = this.origin;
    if (typeof window.switchWorkspace === 'function') {
      if (view === 'principal') {
        window.switchWorkspace('principal');
        if (typeof window.switchPrincipalTab === 'function') {
          window.switchPrincipalTab(principalTab);
        }
      } else {
        window.switchWorkspace(view);
      }
    }
    window.scrollTo({ top: 0, behavior: this.prefersReducedMotion() ? 'auto' : 'smooth' });
    if (triggerEl && typeof triggerEl.focus === 'function') {
      window.setTimeout(() => {
        try {
          triggerEl.focus({ preventScroll: true });
        } catch {
          // Ignore focus errors if element is detached
        }
      }, 60);
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  public start(source?: 'principal' | 'master'): void {
    if (this.isOpen) {
      this.close(false);
    }

    const context = this.detectRoleContext(source);
    this.steps = getTourSteps(context);
    if (this.steps.length === 0) return;

    this.origin = this.captureOriginState();
    this.lang = this.detectInitialLang();
    this.stepIndex = 0;
    this.isOpen = true;

    this.ensureDomMounted();
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundReposition);
    window.addEventListener('scroll', this.boundReposition, true);

    this.renderCurrentStep(true);
  }

  public close(restoreOrigin = true): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('resize', this.boundReposition);
    window.removeEventListener('scroll', this.boundReposition, true);

    if (this.repositionTimer !== null) {
      window.clearTimeout(this.repositionTimer);
      this.repositionTimer = null;
    }
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
      this.spotlightEl = null;
      this.cardEl = null;
      this.arrowEl = null;
    }

    if (restoreOrigin) {
      this.restoreOriginState();
    }
    this.origin = null;
  }

  private finish(): void {
    const ui = getTourUiStrings(this.lang);
    this.close(true);
    if (typeof window.showToast === 'function') {
      window.showToast(ui.finishedToast);
    }
  }

  private goNext(): void {
    if (!this.isOpen) return;
    if (this.stepIndex >= this.steps.length - 1) {
      this.finish();
      return;
    }
    this.stepIndex = getNextStepIndex(this.stepIndex, this.steps.length);
    this.renderCurrentStep(true);
  }

  private goBack(): void {
    if (!this.isOpen || this.stepIndex <= 0) return;
    this.stepIndex = getPrevStepIndex(this.stepIndex, this.steps.length);
    this.renderCurrentStep(true);
  }

  private goToStep(index: number): void {
    if (!this.isOpen) return;
    if (index < 0 || index >= this.steps.length || index === this.stepIndex) return;
    this.stepIndex = index;
    this.renderCurrentStep(true);
  }

  private setLanguage(nextLang: TourLang): void {
    if (this.lang === nextLang) return;
    this.lang = nextLang;
    this.renderCurrentStep(false);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close(true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.goBack();
    }
  }

  private ensureDomMounted(): void {
    if (this.rootEl) return;

    const root = document.createElement('div');
    root.id = 'hifz-quick-tour-root';
    root.className = 'hifz-tour-root no-print';
    root.setAttribute('data-tour-active', 'true');

    const clickBlocker = document.createElement('div');
    clickBlocker.className = 'hifz-tour-backdrop-catcher';
    clickBlocker.setAttribute('aria-hidden', 'true');

    const spotlight = document.createElement('div');
    spotlight.id = 'hifz-tour-spotlight';
    spotlight.className = 'hifz-tour-spotlight';
    spotlight.setAttribute('aria-hidden', 'true');

    const card = document.createElement('div');
    card.id = 'hifz-tour-card';
    card.className = 'hifz-tour-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'hifz-tour-title');
    card.setAttribute('aria-describedby', 'hifz-tour-desc');

    const arrow = document.createElement('div');
    arrow.className = 'hifz-tour-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    card.appendChild(arrow);

    root.appendChild(clickBlocker);
    root.appendChild(spotlight);
    root.appendChild(card);
    document.body.appendChild(root);

    this.rootEl = root;
    this.spotlightEl = spotlight;
    this.cardEl = card;
    this.arrowEl = arrow;
  }

  private activateStepView(step: TourStep): void {
    if (!step.view) return;
    if (typeof window.switchWorkspace === 'function') {
      if (step.view === 'principal' && step.principalTab === 'notices') {
        window.switchWorkspace('notices');
      } else if (step.view === 'principal' && step.principalTab === 'settings') {
        window.switchWorkspace('settings');
      } else {
        window.switchWorkspace(step.view);
        if (step.view === 'principal' && step.principalTab && typeof window.switchPrincipalTab === 'function') {
          window.switchPrincipalTab(step.principalTab);
        }
      }
    }
  }

  private resolveTargetElement(step: TourStep): HTMLElement | null {
    const tryQuery = (selector?: string): HTMLElement | null => {
      if (!selector) return null;
      const el = document.querySelector(selector);
      if (!(el instanceof HTMLElement)) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return null;
      if (rect.width === 0 && rect.height === 0) return null;
      return el;
    };

    return tryQuery(step.targetSelector) || tryQuery(step.fallbackSelector);
  }

  private renderCurrentStep(shouldSwitchAndScroll: boolean): void {
    const step = this.steps[this.stepIndex];
    if (!step || !this.cardEl) return;

    if (shouldSwitchAndScroll) {
      this.activateStepView(step);
    }

    const ui = getTourUiStrings(this.lang);
    const total = this.steps.length;
    const isFirst = this.stepIndex === 0;
    const isLast = this.stepIndex === total - 1;
    const progressPct = getTourProgressPercent(this.stepIndex, total);

    const dotsHtml = this.steps
      .map(
        (s, idx) =>
          `<button type="button" class="hifz-tour-dot${idx === this.stepIndex ? ' is-active' : idx < this.stepIndex ? ' is-done' : ''}" data-tour-dot="${idx}" aria-label="${ui.stepLabel(idx + 1, total)}: ${s.title[this.lang].replace(/"/g, '&quot;')}" aria-current="${idx === this.stepIndex ? 'step' : 'false'}"></button>`
      )
      .join('');

    this.cardEl.innerHTML = `
      <div class="hifz-tour-arrow" aria-hidden="true"></div>
      <div class="hifz-tour-accent-bar" aria-hidden="true"></div>
      <div class="hifz-tour-card-body">
        <div class="hifz-tour-top-row">
          <div class="hifz-tour-step-meta">
            <span class="hifz-tour-mascot" aria-hidden="true">${step.emoji}</span>
            <span class="hifz-tour-step-count">${ui.stepLabel(this.stepIndex + 1, total)}</span>
          </div>
          <div class="hifz-tour-lang-toggle" role="group" aria-label="${ui.langToggleAria}">
            <button type="button" id="hifz-tour-lang-ml" class="hifz-tour-lang-btn${this.lang === 'ml' ? ' is-active' : ''}" aria-pressed="${this.lang === 'ml' ? 'true' : 'false'}">മലയാളം</button>
            <button type="button" id="hifz-tour-lang-en" class="hifz-tour-lang-btn${this.lang === 'en' ? ' is-active' : ''}" aria-pressed="${this.lang === 'en' ? 'true' : 'false'}">English</button>
          </div>
        </div>

        <h3 id="hifz-tour-title" class="hifz-tour-title">${step.title[this.lang]}</h3>
        <p id="hifz-tour-desc" class="hifz-tour-desc">${step.description[this.lang]}</p>

        <div class="hifz-tour-tip">
          <span class="hifz-tour-tip-icon" aria-hidden="true">💡</span>
          <span><strong>${ui.quickTipPrefix}:</strong> ${step.tip[this.lang]}</span>
        </div>

        <div class="hifz-tour-progress-track" role="progressbar" aria-label="${ui.progressAria}" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="hifz-tour-progress-fill" style="width:${progressPct}%"></div>
        </div>

        <div class="hifz-tour-dots-row">${dotsHtml}</div>

        <div class="hifz-tour-footer">
          <button type="button" id="hifz-tour-skip" class="hifz-tour-btn-skip">${ui.skip}</button>
          <div class="hifz-tour-nav-group">
            <button type="button" id="hifz-tour-back" class="hifz-tour-btn-back"${isFirst ? ' disabled' : ''}>${ui.back}</button>
            <button type="button" id="hifz-tour-next" class="hifz-tour-btn-next${isLast ? ' is-finish' : ''}">${isLast ? ui.finish : ui.next}</button>
          </div>
        </div>
      </div>
    `;

    this.arrowEl = this.cardEl.querySelector('.hifz-tour-arrow');

    this.cardEl.querySelector('#hifz-tour-lang-ml')?.addEventListener('click', () => this.setLanguage('ml'));
    this.cardEl.querySelector('#hifz-tour-lang-en')?.addEventListener('click', () => this.setLanguage('en'));
    this.cardEl.querySelector('#hifz-tour-skip')?.addEventListener('click', () => this.close(true));
    this.cardEl.querySelector('#hifz-tour-back')?.addEventListener('click', () => this.goBack());
    this.cardEl.querySelector('#hifz-tour-next')?.addEventListener('click', () => this.goNext());

    this.cardEl.querySelectorAll<HTMLButtonElement>('[data-tour-dot]').forEach((dotBtn) => {
      dotBtn.addEventListener('click', () => {
        const idx = Number(dotBtn.getAttribute('data-tour-dot'));
        if (!Number.isNaN(idx)) this.goToStep(idx);
      });
    });

    if (shouldSwitchAndScroll) {
      if (this.repositionTimer !== null) {
        window.clearTimeout(this.repositionTimer);
      }
      // Allow view animation & D3 layout to settle before scrolling and measuring
      this.repositionTimer = window.setTimeout(() => {
        const target = this.resolveTargetElement(step);
        if (target) {
          const rect = target.getBoundingClientRect();
          const isStickyHeader = Boolean(target.closest('header') || target.closest('#demo-preview-switcher-bar'));
          if (isStickyHeader) {
            window.scrollTo({ top: 0, behavior: this.prefersReducedMotion() ? 'auto' : 'smooth' });
          } else if (rect.top < 78 || rect.top > window.innerHeight * 0.55) {
            const desiredTop = Math.max(0, window.scrollY + rect.top - 96);
            window.scrollTo({
              top: desiredTop,
              behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
            });
          }
        }
        this.updatePositions();
        // Second settle pass after smooth scroll completes
        this.repositionTimer = window.setTimeout(() => {
          this.updatePositions();
        }, 280);
      }, 90);
    } else {
      this.updatePositions();
    }
  }

  private schedulePositionUpdate(): void {
    if (!this.isOpen) return;
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
    }
    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;
      this.updatePositions();
    });
  }

  private updatePositions(): void {
    if (!this.isOpen || !this.cardEl || !this.spotlightEl) return;
    const step = this.steps[this.stepIndex];
    if (!step) return;

    const target = this.resolveTargetElement(step);
    let targetRect: Rect | null = null;
    if (target) {
      const domRect = target.getBoundingClientRect();
      targetRect = {
        top: domRect.top,
        left: domRect.left,
        width: domRect.width,
        height: domRect.height,
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const preferredCardWidth = viewportWidth <= 640 ? viewportWidth - 24 : 390;

    // Measure actual card height at target width
    this.cardEl.style.width = `${preferredCardWidth}px`;
    const measuredHeight = Math.max(220, this.cardEl.getBoundingClientRect().height || 300);

    const pos = computeTourCardPosition({
      targetRect,
      viewportWidth,
      viewportHeight,
      cardWidth: preferredCardWidth,
      cardHeight: measuredHeight,
      margin: viewportWidth <= 640 ? 12 : 16,
      gap: 14,
    });

    if (pos.spotlightRect) {
      this.spotlightEl.style.display = 'block';
      this.spotlightEl.style.top = `${pos.spotlightRect.top}px`;
      this.spotlightEl.style.left = `${pos.spotlightRect.left}px`;
      this.spotlightEl.style.width = `${pos.spotlightRect.width}px`;
      this.spotlightEl.style.height = `${pos.spotlightRect.height}px`;
      this.spotlightEl.classList.remove('is-centered-fallback');
    } else {
      this.spotlightEl.style.display = 'block';
      this.spotlightEl.style.top = '50%';
      this.spotlightEl.style.left = '50%';
      this.spotlightEl.style.width = '0px';
      this.spotlightEl.style.height = '0px';
      this.spotlightEl.classList.add('is-centered-fallback');
    }

    this.cardEl.style.width = `${pos.width}px`;
    this.cardEl.style.top = `${pos.top}px`;
    this.cardEl.style.left = `${pos.left}px`;
    this.cardEl.setAttribute('data-placement', pos.placement);

    if (this.arrowEl) {
      if ((pos.placement === 'bottom' || pos.placement === 'top') && typeof pos.arrowLeft === 'number' && viewportWidth > 640) {
        this.arrowEl.style.display = 'block';
        this.arrowEl.style.left = `${pos.arrowLeft}px`;
      } else {
        this.arrowEl.style.display = 'none';
      }
    }
  }
}

const quickTourController = new QuickTourController();

window.startQuickTour = (source?: 'principal' | 'master') => {
  quickTourController.start(source);
};

window.closeQuickTour = (restoreOrigin = true) => {
  quickTourController.close(restoreOrigin);
};
