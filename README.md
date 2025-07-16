# mikrotik-admin-panel

Mikrotik admin panel using Node.js and Express.js

## Features

- Dashboard view for quick access to important metrics and controls.
- Sidebar navigation for easy access to different sections of the admin panel.
- Integration with MikroTik API for performing actions on the device.

## Project Structure

```
mikrotik-admin-panel
├── src
│   ├── app.js                # Entry point of the application
│   ├── routes                # Contains route definitions
│   │   └── index.js
│   ├── controllers           # Contains controller logic
│   │   └── adminController.js
│   ├── views                 # Contains EJS views
│   │   ├── layouts           # Main layout for the application
│   │   │   └── main.ejs
│   │   ├── partials          # Reusable partial views
│   │   │   └── sidebar.ejs
│   │   └── dashboard.ejs     # Dashboard view
│   ├── public                # Static files
│   │   ├── css               # CSS styles
│   │   │   └── style.css
│   │   └── js                # Client-side JavaScript
│   │       └── main.js
│   └── utils                 # Utility functions
│       └── mikrotikApi.js
├── package.json              # NPM configuration file
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd mikrotik-admin-panel
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to access the admin panel.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.