const LOCK_FORMAT_OPTIONS = ['Years', 'Months', 'Days', 'Hours', 'Minutes']

const formatSeconds = {
  0: 3.154e7, // Years
  1: 2.628e6, // Months
  2: 86400, // Days
  3: 3600, // Hours
  4: 60, // Minutes
}

const parseSeconds = (_seconds) => {
  const days = Math.floor(_seconds / (60 * 60 * 24))
  if (days >= 365 && days <= 730) {
    return '1 year'
  } else if (days >= 730) {
    return `${Math.round(days / 365)} years`
  } else if (days === 30) {
    return '1 month'
  } else if (days > 60 && days < 365) {
    return `${Math.round(days / 30)} months`
  } else if (days === 7) {
    return `1 week`
  } else if (days > 7 && days <= 30) {
    return `${Math.round(days / 4)} weeks`
  } else if (days === 1) {
    return '1 day'
  } else if (days > 1) {
    return `${days} days`
  } else if (_seconds >= 3600) {
    return `${Math.round(_seconds / 3600)} hours`
  } else if (_seconds >= 60) {
    return `${Math.round(_seconds / 60)} minutes`
  } else return `${Math.round(_seconds)} seconds`
}

const calculateInitialDate = (_seconds) => {
  const days = Math.floor(_seconds / (60 * 60 * 24))
  if (days >= 365) {
    return {
      format: 'Years',
      time: Math.round(days / 365),
    }
  } else if (days > 60 && days < 365) {
    return {
      format: 'Months',
      time: Math.round(days / 30),
    }
  } else if (days > 1) {
    return {
      format: 'Days',
      time: days,
    }
  } else if (_seconds >= 3600) {
    return {
      format: 'Hours',
      time: _seconds / 3600,
    }
  } else if (_seconds >= 60) {
    return {
      format: 'Minutes',
      time: _seconds / 60,
    }
  }
}

export {
  parseSeconds,
  calculateInitialDate,
  formatSeconds,
  LOCK_FORMAT_OPTIONS,
}
