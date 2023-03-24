const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// GET ALL PLAYERS DETAILS

app.get("/players/", async (request, response) => {
  try {
    const getPlayersQuery = `
            SELECT * FROM cricket_team;`;

    const playersArray = await db.all(getPlayersQuery);
    response.send(
      playersArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (e) {
    console.log(` Error: ${e.message}`);
    process.exit(1);
  }
});

//CREATE A NEW PLAYER IN THE TEAM(DATABASE)

app.post("/players/", async (request, response) => {
  try {
    const { playerName, jerseyNumber, role } = request.body;

    const postPlayerQuery = `
            INSERT INTO 
            cricket_team (player_name, jersey_number, role)
            VALUES ('${playerName}',${jerseyNumber},'${role}');`;

    const player = await db.run(postPlayerQuery);

    response.send("Player Added To Team");
  } catch (e) {
    console.log(`POST Error: ${e.message}`);
  }
});

// GET A PLAYER FROM TEAM(DATABASE)

app.get("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerQuery = `
        SELECT 
        * 
        FROM 
            cricket_team 
        WHERE 
            player_id = ${playerId};`;

    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(player));
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
});

// UPDATE THE DETAILS OF THE PLAYER IN THE TEAM(DATABASE)

app.put("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const { playerName, jerseyNumber, role } = request.body;
    const updatePlayerQuery = `
        UPDATE 
            cricket_team 
        SET 
            player_name = '${playerName}'
            jersey_number = ${jerseyNumber}
            role = '${role}'
        WHERE 
            player_id = ${playerId}`;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`PUT Error: ${e.message}`);
    process.exit(1);
  }
});

// DELETES A PLAYER FROM THE TEAM

app.delete("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const deletePlayerQuery = `
        DELETE 
        FROM 
            cricket_team 
        WHERE 
            player_id = ${playerId};`;
    await db.run(deletePlayerQuery);

    response.send("Player Removed");
  } catch (e) {
    console.log(`DELETE Error: ${e.message}`);
    process.exit(1);
  }
});

module.exports = app;
