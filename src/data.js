// Formats the leaderboard data
function formatLeaderboard(rows) {
  let users = [];
  rows.forEach((row) => {
    users.push({ username: row[2], daysOfCoding: row[5] });
  });
  console.log(users);

  // Create a new object that combines the daysOfCoding values for each unique username, keeping only the highest value
  const leaderboard = users.reduce((acc, user) => {
    if (!acc[user.username] || user.daysOfCoding > acc[user.username]) {
      acc[user.username] = user.daysOfCoding;
    }
    return acc;
  }, {});

  // Create an array of objects in the format { username, daysOfCoding }
  const leaderboardArray = Object.entries(leaderboard).map(
    ([username, daysOfCoding]) => ({ username, daysOfCoding })
  );

  // Sort the array in descending order based on the number of days of coding
  leaderboardArray.sort((a, b) => b.daysOfCoding - a.daysOfCoding);

  console.log(leaderboardArray[0]);

  return leaderboardArray;
}

//export default { formatLeaderboard };
