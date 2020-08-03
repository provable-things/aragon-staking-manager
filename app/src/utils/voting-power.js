const MINIMUM_VOTING_POWER_THRESHOLD = 0.0001

const parseVotingPower = (_votingPower) => {
  if (!_votingPower && _votingPower !== 0) {
    return '-'
  }

  if (_votingPower === 0) {
    return '0%'
  }

  if (_votingPower < MINIMUM_VOTING_POWER_THRESHOLD) {
    return `<${MINIMUM_VOTING_POWER_THRESHOLD}%`
  }

  return _votingPower - Math.floor(_votingPower)
    ? `~${(_votingPower * 100).toFixed(4)}%`
    : `${(_votingPower * 100).toFixed(0)}%`
}

export { parseVotingPower }
