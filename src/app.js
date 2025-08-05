const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Serve static files
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/img", express.static(path.join(__dirname, "public/img")));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const indexRoutes = require("./routes/index");
const mikrotikRoutes = require("./routes/mikrotik");
const databaseRoutes = require("./routes/database");

app.use("/", indexRoutes);
app.use("/api/mikrotik", mikrotikRoutes);
app.use("/api/database", databaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", { error: "Something broke!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render("error", { error: "Page not found!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});