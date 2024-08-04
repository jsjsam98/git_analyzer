# Git Analyzer

Git Analyzer is a tool designed to visualize git contributions by generating a JSON file containing contributions data and serving it via a local web server.

## Features

-   Extracts git contributions data including commit details and file changes.
-   Generates a JSON file with contributions data.
-   Serves the contributions data via a local web server.
-   Provides an interactive web interface to view and filter contributions.

## Prerequisites

-   Python3
-   Git
-   Both added to PATH

## Quick Start

First, clone the repository to your local machine:

```sh
git clone https://github.com/jsjsam98/git_analyzer.git
cd git_analyzer
```

Step 2: Run the Git Analyzer
Run the git analyzer script to generate the contributions.json file.

```sh
python git_analyzer_json.py <repo_path>
```

or just use the current working directory to quick start

```sh
python git_analyzer_json.py
```

Step 3: Start the Server
Run the server script to start serving the files:

```sh
python server.py
```

Step 4: Access the Web Interface
After running the server script, open your web browser and navigate to:
http://localhost:8000
