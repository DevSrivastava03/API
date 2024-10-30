import express from 'express';
import fs from 'fs/promises';

const app = express();
const port = process.env.PORT || 3001;

let jsonData;

// Reading and combining JSON data from three files
const readJson = async () => {
    const perGameTotals = JSON.parse(await fs.readFile('Per Game Player Total.json', 'utf-8'));
    const regularSeasonPoints = JSON.parse(await fs.readFile('Regular Season pointz.json', 'utf-8'));
    const roster = JSON.parse(await fs.readFile('Roster.json', 'utf-8'));

    jsonData = {
        perGameTotals,
        regularSeasonPoints,
        roster
    };
};

readJson().then(() => {
    app.listen(port, () => {
        console.log(`App listening on ${port}`);
    });
});

// Route to get players below a specified age from the roster
app.get('/age', (req, res) => {
    const reqAge = req.query.max;  // Max age from query
    const selectedPlayers = [];

    jsonData.roster.forEach((player) => {
        if (player.age && player.age <= reqAge) {  // Check age
            selectedPlayers.push(player.last_name);  // Add player if age matches
        }
    });

    res.send(selectedPlayers);  // Send list of player last names
});

// Route to filter players by minimum points scored in the regular season
app.get('/minPoints', (req, res) => {
    const minPoints = req.query.min;  // Min points from query
    const selectedPlayers = [];

    jsonData.regularSeasonPoints.forEach((player) => {
        if (player.total_points && player.total_points >= minPoints) {
            selectedPlayers.push(player.last_name);  // Add player if points match
        }
    });

    res.send(selectedPlayers);  // Send list of player last names
});

// Route to get per-game stats for a specific player
app.get('/playerStats/:player', (req, res) => {
    const reqPlayer = req.params.player;
    const foundPlayer = jsonData.perGameTotals.find(player => player.last_name === reqPlayer);

    if (foundPlayer) {
        res.send(foundPlayer);  // Send player stats if found
    } else {
        res.status(404).send({ error: 'Player not found' });  // Handle not found
    }
});
