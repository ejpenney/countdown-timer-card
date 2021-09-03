// TODO: Years not working, problem appears to be leap years!
// TODO: If we have multiple timers with the same deadline they break
// TODO: If showOnly=next, and a %X date appears in the past, +1 the value (and vice versa for showOnly=last)
// TODO: README.MD
// TODO: showLargest/showSmallest aren't working
// TODO: localize strings

import type { CountdownTimerCardConfig } from './types';
import {
  HomeAssistant,
} from 'custom-card-helpers';


class MetricsObject {
  // OBject contains time duration definitions, a minute is 60 seconds, etc.
  totalSeconds: number;
  roundsAt: number;
  roundsTo: string;

  constructor( totalSeconds: number, roundsAt: number, roundsTo: string ) {
    this.totalSeconds = totalSeconds;
    this.roundsAt = roundsAt;
    this.roundsTo = roundsTo;
  }
}


class ResultObject {
  // Object contains Remaining Time results (positive or negative)
  meridian: string;
  totalMili: number;
  total: number;
  target: number;
  totalSecond: number;
  Second: number;
  totalMinute: number;
  Minute: number;
  totalHour: number;
  Hour: number;
  totalDay: number;
  Day: number;
  totalWeek: number;
  Week: number;

  constructor( total: number, target: Date ) {
    // Determine if the date is in the future or past, record it and then discard the negative sign.
    this.meridian = (total < 0) ? `-` : `+`;
    this.target = target.valueOf();
    this.total = total;  // Total mili seconds remaining positive or negative
    this.totalMili = Math.abs(this.total);  // Absolute MS remaining

    // Placeholder values
    this.totalSecond = 0;
    this.Second = 0
    this.totalMinute = 0;
    this.Minute = 0;
    this.totalHour = 0;
    this.Hour = 0;
    this.totalDay = 0;
    this.Day = 0;
    this.totalWeek = 0;
    this.Week = 0;
  }
}


export class TimerObject {
  // Class actually contains the timer and its relevant data

  hass: HomeAssistant;
  now: Date;
  metrics: {
    Week: MetricsObject;
    Day: MetricsObject;
    Hour: MetricsObject;
    Minute: MetricsObject;
    Second: MetricsObject;
  };
  alwaysShow: boolean;
  showClock: boolean;
  showLargest: string;
  showSmallest: string;
  appendString: string;
  deadline: Date;
  outputString: string;
  remaining: ResultObject;

  constructor(config: CountdownTimerCardConfig, hass: HomeAssistant) {
    this.hass = hass;
    this.now = new Date();
    this.metrics = {
      // year = new MetricsObject(60*60*24*365, 1, 'undefined'),  // Week roundsTo 'Year'
      Week: new MetricsObject(60 * 60 * 24 * 7, 52, 'undefined'),
      Day: new MetricsObject(60 * 60 * 24, 7, 'Week'),
      Hour: new MetricsObject(60 * 60, 24, 'Day'),
      Minute: new MetricsObject(60, 60, 'Hour'),
      Second: new MetricsObject(1, 60, 'Minute'),
    };
    this.alwaysShow = config.alwaysShow || false;
    this.showClock = config.showClock || false;
    this.showLargest = ( this.showClock ) ? 'Hour' : this.getLimit(config.showLargest, 'Week');
    this.showSmallest = ( this.showClock ) ? 'Minute' : this.getLimit(config.showSmallest, 'Minute');
    this.appendString = config.name || '';

    this.deadline = this.getDeadline(config);

    // Is this today (at midnight)? If so, then override some values to trick the sorter into displaying this item
    const dateToday = this.formatDate('%M/%D/%Y');
    if ( this.deadline.toISOString() == dateToday.toISOString() ) {
      this.outputString = `${this.appendString} is today!`;
      this.deadline = this.formatDate('%M/%D/%Y 23:59:59');
      this.remaining = this.getTimeRemaining(this.deadline);
    } else {
      this.remaining = this.getTimeRemaining(this.deadline);
      this.outputString = this.outputTime();
    }
  }

  formatDate(inputDeadline: string): Date {
    // Replaces key characters with CURRENT values (current day, month, year, etc.)
    // YYYY-MM-DDTHH:mm:ss.sssZ

    let deadline = inputDeadline;

    deadline = deadline.replace('%Y', String(this.now.getFullYear()));
    deadline = deadline.replace('%M', String(this.now.getMonth() + 1).padStart(2, '0'));
    deadline = deadline.replace('%D', String(this.now.getDate()).padStart(2, '0'));
    deadline = deadline.replace('%H', String(this.now.getHours()).padStart(2, '0'));
    deadline = deadline.replace('%m', String(this.now.getMinutes()).padStart(2, '0'));
    deadline = deadline.replace('%S', String(this.now.getSeconds()).padStart(2, '0'));
    deadline = deadline.replace('%s', String(this.now.getMilliseconds()).padStart(4, '0'));
    deadline = deadline.replace('%Z', String(this.now.getTimezoneOffset()));

    return new Date(deadline);
  }

  getTimeRemaining(target: Date): ResultObject {
    // Generate the ResultObject for this timer, lots of precarious math, don't touch unless you're sure something's broken!

    const total = target.valueOf() - this.now.valueOf();
    const result = new ResultObject(total, target);

    for ( const metric of Object.keys(this.metrics) ) {
      result['total' + metric] = Math.floor((result.totalMili / 1000 / this.metrics[metric].totalSeconds));

      // Round up if this is showSmallest, smallest item gets a +1 to include whatever we trimmed
      const mathFunc = (metric == this.showSmallest) ? Math.ceil : Math.floor;
      const tempResult = mathFunc((result.totalMili / 1000 / this.metrics[metric].totalSeconds) % this.metrics[metric].roundsAt);
      if ( tempResult == this.metrics[metric].roundsAt && this.metrics[metric].roundsTo != 'undefined' ) {
        result[this.metrics[metric].roundsTo] += 1;
        result['total' + this.metrics[metric].roundsTo] += 1;
        result[metric] = 0;
      } else {
        result[metric] = tempResult;
      }
    }

    return result;
  }

  getLimit(userInput: string, defaultVal: string): string {
    // Prune's trailing "s" for the metrics lookups, then ensures the string is capitalized.
    // Decides whether we've been provided a show(Smallest/Largest) value or if we should use the default.

    console.log("DEBUG: Started with=" + userInput);
    if ( userInput ) {
      if ( userInput.endsWith('s') ) {
        userInput = userInput.slice(0, -1);
      }
      userInput = userInput.charAt(0).toUpperCase() + userInput.slice(1)
    }
    console.log("DEBUG: Cleaned to=" + userInput);

    if ( typeof this.metrics[userInput] === 'undefined' ) {
      userInput = defaultVal;
    }

    console.log("DEBUG: Ended with=" + userInput);
    return userInput;
  }

  outputTime(): string {
    // Depending on if showClock is true or not, the output format is different, this handles the bulk of that parsing.

    let output: string[] = [];

    const outputFunc = ( this.showClock === true ) ? this.genClock : this.genString;
    const joinString = ( this.showClock === true ) ? ':' : ', ';

    output.push(outputFunc(this.remaining['total' + this.showLargest], this.showLargest));
    const metricsArry = Object.keys(this.metrics);
    const limit = metricsArry.indexOf(this.showSmallest);
    console.log("DEBUG: showLargest=" + this.showLargest);
    console.log("DEBUG: showSmallest=" + this.showSmallest);
    console.log("DEBUG: limit=" + limit);
    console.log("DEBUG: metricsArry=" + String(metricsArry));

    let nonZero = (this.remaining['total' + this.showLargest] > 0) ? true : false;
    for ( let i = metricsArry.indexOf(this.showLargest) + 1; i <= limit; i++ ) {
      const num = this.remaining[metricsArry[i]];
      if ( num > 0 ) {
        nonZero = true;
      }
      if ( this.showClock === true && num == 0 && nonZero === false ) {
        break;
      }
      output.push(outputFunc(num, metricsArry[i]));
    }

    output = output.filter(e => e != "");
    if ( this.showClock === false && output.length > 1 ) {
      output[output.length - 1] = 'and ' + output[output.length - 1];
    }

    let outputString = output.join(joinString);
    if ( this.remaining['meridian'] == '+' ) {
      outputString += ` until`;
    } else {
      outputString += ` since`;
    }

    return outputString + ' ' + this.appendString + '!';
  }

  genString(numVal: number, units: string): string {
    // String assembly function for long form times (7 days, 3 hours, 25 minutes, 32 seconds)

    let output = "";
    if ( numVal > 1 ) {
      units += 's';
    }

    if ( numVal > 0 ) {
      output = `${numVal} ${units}`;
    }

    return output;
  }

  genClock(numVal: number, _units: unknown): string {
    // String assembly function for clock style times(07:03:25:32)

    const output = String(numVal).padStart(2, '0');
    return output;
  }

  getDeadline(config: CountdownTimerCardConfig): Date {
    // Parse config for our actual deadline

    let deadline: string;

    // Are we retrieving the deadline from an entity or its attribute?
    if ( typeof config.entity !== 'undefined' ) {
      if ( typeof config.attribute !== 'undefined' ) {
        deadline = this.hass.states[config.entity].attributes[config.attribute];
      } else {
        deadline = this.hass.states[config.entity].state;
      }
    } else {
        deadline = config.deadline;
    }

    // Can be '2015-12-31', '31/12/2015', 'December 31 2015', or 'December 31 2015 23:59:59 GMT+0200'
    return this.formatDate(deadline);
  }
}
