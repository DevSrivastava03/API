import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';

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

// Route to get players by position from the roster
app.get('/position', (req, res) => {
    const reqPosition = req.query.pos;  // Position from query parameter
    const selectedPlayers = jsonData.roster.filter(player => player.Pos === reqPosition);
    res.send(selectedPlayers.map(player => player.Player));  // Send list of player names
});

// Route to get players by weight from the roster
app.get('/weight', (req, res) => {
    const maxWeight = parseInt(req.query.max, 10);  // Max weight from query parameter
    const minWeight = parseInt(req.query.min, 10);  // Min weight from query parameter
    const selectedPlayers = jsonData.roster.filter(player => {
        const weight = parseInt(player.Wt, 10);
        return (!isNaN(minWeight) ? weight >= minWeight : true) &&
               (!isNaN(maxWeight) ? weight <= maxWeight : true);
    });
    res.send(selectedPlayers.map(player => player.Player));  // Send list of player names
});

// Route to get players by experience from the roster
app.get('/experience', (req, res) => {
    const minExp = parseInt(req.query.min, 10);  // Min experience from query parameter
    const selectedPlayers = jsonData.roster.filter(player => {
        const exp = parseInt(player.Exp, 10);
        return !isNaN(minExp) && exp >= minExp;
    });
    res.send(selectedPlayers.map(player => player.Player));  // Send list of player names
});
