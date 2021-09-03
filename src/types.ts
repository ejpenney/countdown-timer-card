import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'countdown-timer-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

// TODO Add your configuration elements here for type-checking
export interface CountdownTimerCardConfig extends LovelaceCardConfig {
  type: string;
  title: string;
  timers?: {
    name: string;
    deadline: string;
    showSmallest?: string;
    showLargest?: string;
    showOnly?: string;
    alwaysShow?: boolean;
    showClock?: boolean;
  };
  name: string;
  deadline: string;
  // TODO: These 3 should be string|undefined but timer-objects doesn't like that
  showSmallest: string;
  showLargest: string;
  showOnly: string;
  alwaysShow?: boolean;
  showClock?: boolean;

  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
