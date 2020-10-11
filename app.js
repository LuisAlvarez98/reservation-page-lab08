// imports
let express = require("express");
let path = require("path");
// express init
let app = express();
const PORT = 3000;
// init of arrays
let reservedTables = [];
let waitingList = [];
// exprsss config
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// gets the home view
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/home.html"));
});
// gets the reserve view
app.get("/reserve", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/reserve.html"));
});
// gets the tables view
app.get("/tables", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/tables.html"));
});

// get tables. returns the table array
app.get("/api/tables", (req, res) => {
  if (!req) return res.send(404);
  res.json(reservedTables).status(200);
});
// check off tables endpoint
app.delete("/api/tables/:id", (req, res) => {
  let id = req.params.id;
  reservedTables = reservedTables.filter((item) => item.id != id);

  if (waitingList.length <= 0) {
    return res
      .json({
        message: "The reservation was checked off successfully.",
      })
      .status(200);
  } else {
    reservedTables.push(waitingList[0]);
    waitingList = waitingList.filter((item) => waitingList[0].id != item.id);
  }
});
// deletes all the current tables and adds the waiting list tables to the reservation list.
app.delete("/api/tables/clear", (req, res) => {
  reservedTables = [];
  waitingList.forEach((item, index) => {
    if (index < 5) {
      reservedTables.push(item);
      waitingList[index] = "";
    }
  });
  waitingList = waitingList.filter((item) => item != "");
});
// reserve endpoints. basically reserves a table or adds it into the waiting list
app.post("/api/reserve", (req, res) => {
  // Gets the reservation object
  let reservation = req.body;

  // Validates if the reservation has an id that already exists.
  reservedTables.forEach((item) => {
    if (reservation.id === item.id) {
      return res
        .json({
          message: "The reservation with this id already exists",
        })
        .status(400);
    }
  });

  // Checks if it is not a bad request
  if (res.statusCode != 400) {
    if (reservedTables.length >= 5) {
      // Pushes the table into the waiting list
      waitingList.push(reservation);
      res.status(200).json({
        message:
          "Your reservation was added to the waiting list because there are no tables available. FALSE",
        data: waitingList,
      });
    } else {
      // Pushes the table into the reservation array.
      reservedTables.push(reservation);
      // Send the json
      res.status(200).json({
        message: "Your reservation was added successfully.! TRUE",
        data: reservation,
      });
    }
  }
});
// waitlist endpoint : returns the waiting list json array
app.get("/api/waitlist", (req, res) => {
  if (!req) return res.send(404);
  res.json(waitingList).status(200);
});
// listen
app.listen(3000, () => {
  console.log(`Listening on port: ${PORT}`);
});
