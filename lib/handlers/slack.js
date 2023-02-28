module.exports = function slackHandler (req, res) {
  const challenge = req.body?.challenge
  console.log(`slackHandler[${challenge || 'passthrough'}]`)
  if (!challenge) return false
  res.send(challenge)
  return true
}
