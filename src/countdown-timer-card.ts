/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  TemplateResult,
  css,
  PropertyValues,
  CSSResultGroup,
} from 'lit';
import { customElement, property, state } from "lit/decorators";
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types
import { TimerObject } from "./countdown-timer";
import './editor';

import type { CountdownTimerCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  COUNTDOWNTIMER-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'countdown-timer-card',
  name: 'Countdown Timer Card',
  description: localize('common.description'),
});

@customElement('countdown-timer-card')
export class CountdownTimerCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('countdown-timer-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit-element.polymer-project.org/guide/properties
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: CountdownTimerCardConfig;

  // https://lit-element.polymer-project.org/guide/properties#accessors-custom
  public setConfig(config: CountdownTimerCardConfig): void {
    if ( !config || (config.entity && config.deadline) ) {
      throw new Error(localize('configure.invalid_configuration'));
    }
    if ((config.entity || config.deadline) && config.timers) {
      throw new Error(localize('configure.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    if (!config.timers && !config.deadline && !config.entity) {
      throw new Error(localize('configure.missing_timer'));
    }
    for (const index in config.timers) {
        const timer = config.timers[index];

        if(!timer.deadline && !timer.entity) {
            throw new Error(localize('configure.invalid_timer'));
        }
    }
    if ((config.deadline || config.entity) && !config.name) {
      throw new Error(localize('invalid_timer'));
    }
    this.config = config;
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | void {
    if ( this.config.show_warning ) {
      return this._showWarning(localize('common.show_warning'));
    }

    if ( this.config.show_error ) {
      return this._showError(localize('common.show_error'));
    }

    // List of parameters for global override
    const subParams = ['showLargest', 'showSmallest', 'showClock', 'name', 'alwaysShow'];
    const title = this.config.title ? this.config.title : "";
    const showOnly = (typeof this.config.showOnly !== 'undefined' && ['next', 'last'].includes(this.config.showOnly)) ? this.config.showOnly : 'all';

    const timers = {};
    let forHTML: TemplateResult[] = [];
    if (this.config.timers) { // Parse a list of timers
      for (const timerNumber in this.config.timers) {
        const timerConfig = Object.assign({}, this.config.timers[timerNumber]);

        // Allow Global parameter overrides
        for (const param in subParams) {
          const parameter = subParams[param];

          if (typeof timerConfig[parameter] === 'undefined' && typeof this.config[parameter] !== 'undefined') {
            timerConfig[parameter] = this.config[parameter];
          }
        }

        const timer = new TimerObject(timerConfig, this.hass);
        if (timer.alwaysShow) { // Ignore below filters
          forHTML.push(html`${timer.outputString}<br />`);
        }

        timers[timer.remaining['target']] = timer.outputString
      }
    } else {  // Parse single timer
      const timer = new TimerObject(this.config, this.hass);
      timers[timer.remaining['target']] = timer.outputString;
    }

    // Are we only showing next/last?
    if ( showOnly != 'all' ) {
      const nowMarker = Date.parse(new Date().toDateString());
      timers[nowMarker] = "Now Marker";
      const durations = Object.keys(timers);
      durations.sort();

      // We need to know when "now" is relative to those.
      let toDisplay = durations.indexOf(String(nowMarker));
      if ( showOnly == 'last') {
        toDisplay -= 1;
      } else if (showOnly == 'next') {
        toDisplay += 1;
      } else {
        throw new Error(localize('configure.invalid_value') + ` showOnly=${showOnly}`);
      }

      // Did we get any valid timers above?
      if ( typeof timers[durations[toDisplay]] !== 'undefined' ) {
        forHTML.push(html`${timers[durations[toDisplay]]}<br />`);
      }
      if ( forHTML.length == 0 ) {
        forHTML = [html`${localize('timer.none')}`];
      }
    } else { // Push everything
      for ( const timer in timers ) {
        forHTML.push(html`${timers[timer]}<br />`);
      }
    }

    return html`
      <ha-card
        .header=${title}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`CountdownTimer: ${this.config.entity || localize('timer.no_entity')}`}
      ><div class="card-content">${forHTML}</div>
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResultGroup {
    return css``;
  }
}
