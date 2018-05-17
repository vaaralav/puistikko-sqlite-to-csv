const fs = require('fs');
const { promisify } = require('util');
const toCSV = require('csv-stringify');
const parseCSV = require('csv-parse');
const sqlite = require('sqlite');
const { oneLine } = require('common-tags');
const writeCsv = require('kipa-csv-import/writeCsv');

const GET_TEAM_TRACK_RESULT_QUERY = oneLine(`
SELECT tulos.aika
FROM tulos INNER JOIN
  kilpailija ON tulos.kilpailija = kilpailija.id
INNER JOIN sarja ON tulos.sarja = sarja.id
WHERE kilpailija.nimi = $team AND sarja.nimi = $track;
`);

const EI_SUORITUSTA = 'e';

const getTeamTrackResult = async (db, team, track) => {
  const result = await db.get(GET_TEAM_TRACK_RESULT_QUERY, {
    $team: team,
    $track: track
  });
  return result ? result.aika : EI_SUORITUSTA;
};

module.exports = async (
  dbName,
  outputFileName,
  teamsFileName,
  series,
  tracks
) => {
  // Read team numbers
  const data = await promisify(fs.readFile)(teamsFileName);
  const teamNumbers = [].concat(...(await promisify(parseCSV)(data, {})));

  // Create complete track names
  const trackNames = tracks.split('').map(track => `${series}-${track}`);

  // Query results
  const db = await sqlite.open(dbName, { Promise });
  const results = await Promise.all(
    // For every team build results
    // {
    //   vartio: teamNumber,
    //   results: [<1st track result>, <2nd track result>, ...]
    // }
    teamNumbers.map(async teamNumber => ({
      vartio: teamNumber,
      results: await Promise.all(
        // Get team's result for each track
        trackNames.map(async trackName =>
          getTeamTrackResult(db, teamNumber, trackName)
        )
      )
    }))
  );

  writeCsv(outputFileName, results);
};
