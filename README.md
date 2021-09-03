# Countdown Timer Card by [@ejpenney](https://www.github.com/ejpenney)

A simple card for displaying the amount of time till or since some date/time.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[![Discord][discord-shield]][discord]
[![Community Forum][forum-shield]][forum]

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/ejpenney)

## Options

| Name              | Type    | Scope         | Requirement                  | Description                                                                                                                                              | Default                                      |
| ----------------- | ------- | ------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| type              | string  | Global Only   | **Required**                 | `custom:countdown-timer-card`                                                                                                                            |
| name              | string  | Global/timers | **Required**                 | Timer Name                                                                                                                                               |
| deadline          | string  | Global/timers | **Required**                 | Date/Time string as documented here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#date_time_string_format |
| timers            | list    | Global Only   | **Optional**                 | One of `all next last` Shows only most recent or nearest upcoming                                                                                        | `all`                                        |
| showOnly          | string  | Global/timers | **Optional**                 | One of `all next last` Shows only most recent or nearest upcoming                                                                                        | `all`                                        |
| showSmallest      | string  | Global/timers | **Optional**                 | One of `days weeks hours minutes seconds` Sets smallest time unit to be displayed                                                                        | `minutes`                                    |
| showLargest       | string  | Global/timers | **Optional**                 | One of `days weeks hours minutes seconds` Sets largest time unit to be displayed                                                                         | if showClock is `true`, `hours` else `weeks` |
| alwaysShow        | boolean | Global/timers | **Optional**                 | Forces a timer to be displayed even if it would be filtered by showOnly                                                                                  | `false`                                      |
| showClock         | boolean | Global/timers | **Optional**                 | Display times as a clock, like `HH:MM:SS`                                                                                                                | `false`                                      |
| entity            | string  | Global/timers | **Optional**                 | Home Assistant entity ID to retrieve the date/time from.                                                                                                 | `none`                                       |
| attribute         | string  | Global/timers | **Optional**                 | **Requires `entity`** Home Assistant specified attribute of Home Assistant entity to get date from.                                                      | `none`                                       |
| tap_action        | object  | **Optional**  | Action to take on tap        | `action: more-info`                                                                                                                                      |
| hold_action       | object  | **Optional**  | Action to take on hold       | `none`                                                                                                                                                   |
| double_tap_action | object  | **Optional**  | Action to take on double tap | `none`                                                                                                                                                   |
| show_error        | boolean | Global Only   | **Optional**                 | Show what an error looks like for the card                                                                                                               | `false`                                      |
| show_warning      | boolean | Global Only   | **Optional**                 | Show what a warning looks like for the card                                                                                                              | `false`                                      |

## Action Options

| Name            | Type   | Requirement  | Description                                                                                                                            | Default     |
| --------------- | ------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| action          | string | **Required** | Action to perform (more-info, toggle, call-service, navigate url, none)                                                                | `more-info` |
| navigation_path | string | **Optional** | Path to navigate to (e.g. /lovelace/0/) when action defined as navigate                                                                | `none`      |
| url             | string | **Optional** | URL to open on click when action is url. The URL will open in a new tab                                                                | `none`      |
| service         | string | **Optional** | Service to call (e.g. media_player.media_play_pause) when action defined as call-service                                               | `none`      |
| service_data    | object | **Optional** | Service data to include (e.g. entity_id: media_player.bedroom) when action defined as call-service                                     | `none`      |
| haptic          | string | **Optional** | Haptic feedback for the [Beta IOS App](http://home-assistant.io/ios/beta) _success, warning, failure, light, medium, heavy, selection_ | `none`      |
| repeat          | number | **Optional** | How often to repeat the `hold_action` in milliseconds.                                                                                 | `non`       |

## Starting a new card from countdown-timer-card

![Preview](https://user-images.githubusercontent.com/21226768/132069331-7fa13211-26da-4ebc-8145-bc0ea7e4956f.png)

```yaml
type: custom:countdown-timer-card
title: Solstices
showLargest: Hour
timers:
  - name: Summer Solstice
    deadline: June 21 %Y 20:31:00 GMT-0700
    showLargest: weeks
  - name: Winter Solstice
    deadline: December 21, %Y 07:58:00 GMT-0700
    showSmallest: days
  - name: Sunset
    entity: sun.sun
    attribute: next_setting
    showClock: true
  - name: Two Weeks
    deadline: '2021-07-27'
    showSmallest: days
  - name: Breakfast
    deadline: '%Y-%M-%DT08:30:00'
  - name: Dinner
    deadline: '%Y-%M-%DT17:30:00'
  - name: Today
    deadline: '%Y/%M/%D'
```

[commits-shield]: https://img.shields.io/github/commit-activity/y/custom-cards/countdown-timer-card.svg?style=for-the-badge
[commits]: https://github.com/custom-cards/countdown-timer-card/commits/master
[devcontainer]: https://code.visualstudio.com/docs/remote/containers
[discord]: https://discord.gg/5e9yvq
[discord-shield]: https://img.shields.io/discord/330944238910963714.svg?style=for-the-badge
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/c/projects/frontend
[license-shield]: https://img.shields.io/github/license/custom-cards/countdown-timer-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2020.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/custom-cards/countdown-timer-card.svg?style=for-the-badge
[releases]: https://github.com/custom-cards/countdown-timer-card/releases
